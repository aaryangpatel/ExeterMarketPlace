import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Link, Routes, useNavigate } from 'react-router-dom';
import { auth, firestore, provider } from './firebase';
import { signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import './App.css';

function App() {
    const [user, setUser] = useState(null);
    const [items, setItems] = useState([]);

    const signInWithGoogle = async () => {
        const result = await signInWithPopup(auth, provider);
        setUser(result.user);
    };

    const signOut = () => {
        firebaseSignOut(auth);
        setUser(null);
    };

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
                            <button className="auth-btn" onClick={signOut}>Sign Out</button>
                        ) : (
                            <button className="auth-btn" onClick={signInWithGoogle}>Sign in with Google</button>
                        )}
                    </nav>
                </header>
                <Routes>
                    <Route path="/" element={<HomePage items={items} />} />
                    <Route path="/add-item" element={<AddItemPage user={user} />} />
                    <Route path="/edit-items" element={<EditItemsPage user={user} items={items} />} />
                </Routes>
            </div>
        </Router>
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
                    </div>
                ))}
            </div>
        </div>
    );
}

function AddItemPage({ user }) {
    const navigate = useNavigate();
    const [newItem, setNewItem] = useState({ title: '', description: '', price: '', location: '', contactInfo: '' });

    if (!user) {
        navigate('/');
        return null;
    }

    const handleAddItem = async (e) => {
        e.preventDefault();
        await addDoc(collection(firestore, 'items'), { ...newItem, owner: user.displayName, ownerEmail: user.email, timestamp: serverTimestamp() });
        navigate('/');
    };

    return (
        <div className="page-container">
            <h2 className="page-title">Add a New Item</h2>
            <form className="add-item-form" onSubmit={handleAddItem}>
                <input type="text" placeholder="Title" value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} required className="input-field" />
                <textarea placeholder="Description" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} required className="textarea-field" />
                <input type="text" placeholder="Price" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} className="input-field" />
                <input type="text" placeholder="Location" value={newItem.location} onChange={(e) => setNewItem({ ...newItem, location: e.target.value })} className="input-field" />
                <input type="text" placeholder="Contact Info" value={newItem.contactInfo} onChange={(e) => setNewItem({ ...newItem, contactInfo: e.target.value })} className="input-field" />
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

export default App;
