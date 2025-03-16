import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Link, Routes, useNavigate } from 'react-router-dom';
import { auth, firestore, provider } from './firebase';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, updateProfile } from 'firebase/auth';
import { collection, onSnapshot, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import './App.css';

function App() {
    const [user, setUser] = useState(null);
    const [items, setItems] = useState([]);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(firestore, 'items'), (snapshot) => {
            const itemsData = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
            setItems(itemsData);
        });
        return () => unsubscribe();
    }, []);

    return (
        <Router>
            <div className="App">
                <header>
                    <div className="header-left">
                        <h1 className="header-title">Phillips Exeter Academy Marketplace</h1>
                    </div>
                    <nav className="header-right">
                        <Link to="/" className="header-nav-link">Home</Link>
                        {user && <Link to="/add-item" className="header-nav-link">Add Item</Link>}
                        {user && <Link to="/edit-items" className="header-nav-link">Edit Posts</Link>}
                        {user ? (
                            <button className="auth-btn" onClick={() => { firebaseSignOut(auth); setUser(null); }}>Sign Out</button>
                        ) : (
                            <>
                                <Link to="/auth/signup" className="auth-btn">Sign Up</Link>
                                <Link to="/auth/signin" className="auth-btn">Sign In</Link>
                            </>
                        )}
                    </nav>
                </header>
                <Routes>
                    <Route path="/" element={<HomePage items={items} />} />
                    <Route path="/add-item" element={<AddItemPage user={user} />} />
                    <Route path="/edit-items" element={<EditItemsPage user={user} items={items} />} />
                    <Route path="/auth/signup" element={<AuthPage setUser={setUser} type="signup" />} />
                    <Route path="/auth/signin" element={<AuthPage setUser={setUser} type="signin" />} />
                </Routes>
            </div>
        </Router>
    );
}

function AuthPage({ setUser, type }) {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const signUpWithEmail = async () => {
        if (!name || !email || !password) {
            alert("Please enter all fields.");
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Updating the user's display name
            await updateProfile(userCredential.user, {
                displayName: name
            });

            setUser(userCredential.user);
            navigate('/');
        } catch (error) {
            alert(error.message);
        }
    };

    const signInWithEmail = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            setUser(userCredential.user);
            navigate('/');
        } catch (error) {
            alert(error.message);
        }
    };

    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            setUser(result.user);
            navigate('/');
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="page-container">
            <h2 className="page-title">{type === "signup" ? "Sign Up" : "Sign In"}</h2>
            {type === "signup" && (
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                />
            )}
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
            />
            {type === "signup" ? (
                <button className="auth-btn" onClick={signUpWithEmail}>Sign Up</button>
            ) : (
                <>
                    <button className="auth-btn" onClick={signInWithEmail}>Sign In with Email</button>
                    <button className="auth-btn google-btn" onClick={signInWithGoogle}>Sign In with Google</button>
                </>
            )}
        </div>
    );
}

function AddItemPage({ user }) {
    const navigate = useNavigate();
    const [newItem, setNewItem] = useState({ title: '', description: '', price: '', location: '', contactInfo: '', imageBase64: '' });

    if (!user) {
        navigate('/');
        return null;
    }

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setNewItem({ ...newItem, imageBase64: reader.result });
        };
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        await addDoc(collection(firestore, 'items'), { ...newItem, owner: user.displayName, ownerEmail: user.email, timestamp: serverTimestamp() });
        navigate('/');
    };

    return (
        <div className="page-container">
            <h2 className="page-title">Add a New Item</h2>
            <form className="add-item-form" onSubmit={handleAddItem}>
                <input
                    type="text"
                    placeholder="Title"
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    required
                    className="input-field"
                />
                <textarea
                    placeholder="Description"
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    required
                    className="textarea-field"
                />
                <input
                    type="text"
                    placeholder="Price"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    className="input-field"
                />
                <input
                    type="text"
                    placeholder="Location"
                    value={newItem.location}
                    onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                    className="input-field"
                />
                <input
                    type="text"
                    placeholder="Contact Info"
                    value={newItem.contactInfo}
                    onChange={(e) => setNewItem({ ...newItem, contactInfo: e.target.value })}
                    className="input-field"
                />
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="input-field"
                />
                {newItem.imageBase64 && <img className="image-preview" src={newItem.imageBase64} alt="Preview" />}
                <button type="submit" className="submit-btn">Add Item</button>
            </form>
        </div>
    );
}

function EditItemsPage({ user, items }) {
    const navigate = useNavigate();

    if (!user) {
        navigate('/');
        return null;
    }

    const userItems = items.filter(item => item.ownerEmail === user.email);

    const handleUpdate = async (id, updatedData) => {
        await updateDoc(doc(firestore, 'items', id), updatedData);
    };

    const handleDelete = async (id) => {
        await deleteDoc(doc(firestore, 'items', id));
    };

    return (
        <div className="page-container">
            <h2 className="page-title">Edit Your Posts</h2>
            {userItems.length === 0 ? <p>No posts to edit.</p> : userItems.map((item) => (
                <div key={item.id} className="edit-item">
                    <input type="text" defaultValue={item.title} onBlur={(e) => handleUpdate(item.id, { title: e.target.value })} className="input-field" />
                    <textarea defaultValue={item.description} onBlur={(e) => handleUpdate(item.id, { description: e.target.value })} className="textarea-field" />
                    <button className="delete-btn" onClick={() => handleDelete(item.id)}>Delete</button>
                </div>
            ))}
        </div>
    );
}

function HomePage({ items }) {
    return (
        <div className="page-container">
            <h2 className="page-title">Marketplace Items</h2>
            <div className="item-list">
                {items.map((item) => (
                    <div key={item.id} className="item">
                        <h3 className="item-title">{item.title}</h3>
                        <p className="item-description">{item.description}</p>
                        <p><strong>Price: </strong>{item.price || 'Free'}</p>
                        <p><strong>Location: </strong>{item.location}</p>
                        <p><strong>Contact: </strong>{item.contactInfo}</p>
                        <p><strong>Owner: </strong>{item.owner}</p>
                        {item.imageBase64 && <img className="item-image" src={item.imageBase64} alt={item.title} />}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;
