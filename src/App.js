import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Link, Routes, useNavigate } from 'react-router-dom';
import { auth, firestore, provider } from './firebase';
import { signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import './App.css';

function App() {
    const [user, setUser] = useState(null);
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState({
        title: '',
        description: '',
        price: '',
        location: '',
        contactInfo: '',
        imageBase64: '',
    });

    // Handle Google login
    const signInWithGoogle = async () => {
        const result = await signInWithPopup(auth, provider);
        setUser(result.user);
    };

    const signOut = () => {
        firebaseSignOut(auth);
        setUser(null);
    };

    // Fetch marketplace items
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
                        {user ? (
                            <button className="auth-btn" onClick={signOut}>Sign Out</button>
                        ) : (
                            <button className="auth-btn" onClick={signInWithGoogle}>Sign in with Google</button>
                        )}
                    </nav>
                </header>

                <Routes>
                    <Route path="/" element={<HomePage items={items} />} />
                    <Route path="/add-item" element={<AddItemPage user={user} newItem={newItem} setNewItem={setNewItem} />} />
                </Routes>
            </div>
        </Router>
    );
}

// HomePage Component
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

// AddItemPage Component
function AddItemPage({ user, newItem, setNewItem }) {
    const navigate = useNavigate();

    // Redirect to Home if the user is not logged in
    if (!user) {
        navigate('/');
        return <div className="signin-message">Please log in to add an item.</div>;
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
        if (!newItem.title || !newItem.description) {
            alert('Please fill in all required fields.');
            return;
        }

        await addDoc(collection(firestore, 'items'), {
            ...newItem,
            owner: user.displayName,
            ownerEmail: user.email,
            timestamp: serverTimestamp(),
        });

        setNewItem({
            title: '',
            description: '',
            price: '',
            location: '',
            contactInfo: '',
            imageBase64: '',
        });

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

export default App;
