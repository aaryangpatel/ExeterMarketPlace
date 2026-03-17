import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Link, Routes, useNavigate, useLocation } from 'react-router-dom';
import { auth, firestore, provider } from './firebase';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, updateProfile } from 'firebase/auth';
import { collection, onSnapshot, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import './App.css';

// Icons as inline SVG components
const Icons = {
    Home: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    ),
    Plus: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    ),
    Edit: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    ),
    User: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    ),
    LogOut: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    ),
    MapPin: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    ),
    Mail: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
        </svg>
    ),
    Package: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
    ),
    Image: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
        </svg>
    ),
    Upload: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
    ),
    Trash: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
    ),
    Check: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
    Google: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
    ),
};

// Header Component
function Header({ user, onSignOut }) {
    const location = useLocation();

    return (
        <header className="header">
            <div className="header-container">
                <Link to="/" className="header-brand">
                    <img src="/lion.png" alt="Exeter" className="header-logo" />
                    <h1 className="header-title">Exeter <span>Marketplace</span></h1>
                </Link>
                <nav className="header-nav">
                    <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                        <Icons.Home />
                        <span>Browse</span>
                    </Link>
                    {user && (
                        <>
                            <Link to="/add-item" className={`nav-link ${location.pathname === '/add-item' ? 'active' : ''}`}>
                                <Icons.Plus />
                                <span>Sell</span>
                            </Link>
                            <Link to="/edit-items" className={`nav-link ${location.pathname === '/edit-items' ? 'active' : ''}`}>
                                <Icons.Edit />
                                <span>My Posts</span>
                            </Link>
                        </>
                    )}
                    {user ? (
                        <button className="btn btn-ghost" onClick={onSignOut}>
                            <Icons.LogOut />
                            <span>Sign Out</span>
                        </button>
                    ) : (
                        <>
                            <Link to="/auth/signin" className="btn btn-ghost">
                                Sign In
                            </Link>
                            <Link to="/auth/signup" className="btn btn-primary">
                                Sign Up
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}

// Item Card Component
function ItemCard({ item }) {
    return (
        <div className="item-card fade-in">
            <div className="item-card-image">
                {item.imageBase64 ? (
                    <img src={item.imageBase64} alt={item.title} />
                ) : (
                    <div className="item-card-placeholder">
                        <Icons.Image />
                    </div>
                )}
            </div>
            <div className="item-card-content">
                <h3 className="item-card-title">{item.title}</h3>
                <p className="item-card-description">{item.description}</p>
                <p className="item-card-price">{item.price ? `$${item.price}` : 'Free'}</p>
                <div className="item-card-meta">
                    <div className="item-card-meta-row">
                        <Icons.MapPin />
                        <span>{item.location || 'On Campus'}</span>
                    </div>
                    <div className="item-card-meta-row">
                        <Icons.User />
                        <span>{item.owner}</span>
                    </div>
                    <div className="item-card-meta-row">
                        <Icons.Mail />
                        <span>{item.contactInfo || item.ownerEmail}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Home Page Component
function HomePage({ items }) {
    return (
        <main className="main-content">
            <div className="container">
                <div className="page-header">
                    <h2 className="page-title">Browse Listings</h2>
                    <p className="page-subtitle">Find items from fellow Exeter students</p>
                </div>
                {items.length === 0 ? (
                    <div className="empty-state">
                        <Icons.Package />
                        <h3 className="empty-state-title">No listings yet</h3>
                        <p className="empty-state-text">Be the first to post an item for sale!</p>
                    </div>
                ) : (
                    <div className="items-grid">
                        {items.map((item) => (
                            <ItemCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

// Auth Page Component
function AuthPage({ setUser, type }) {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const signUpWithEmail = async (e) => {
        e.preventDefault();
        if (!name || !email || !password) {
            alert("Please enter all fields.");
            return;
        }
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: name });
            setUser(userCredential.user);
            navigate('/');
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const signInWithEmail = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            setUser(userCredential.user);
            navigate('/');
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const signInWithGoogle = async () => {
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, provider);
            setUser(result.user);
            navigate('/');
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const isSignUp = type === "signup";

    return (
        <div className="auth-layout">
            <div className="form-container">
                <div className="form-card">
                    <div className="form-header">
                        <h2 className="form-title">{isSignUp ? "Create Account" : "Welcome Back"}</h2>
                        <p className="form-subtitle">
                            {isSignUp 
                                ? "Join the Exeter Marketplace community" 
                                : "Sign in to access your account"}
                        </p>
                    </div>
                    
                    <form onSubmit={isSignUp ? signUpWithEmail : signInWithEmail}>
                        {isSignUp && (
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="form-input"
                                    required
                                />
                            </div>
                        )}
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                placeholder="you@exeter.edu"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="form-input"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="form-input"
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
                        </button>
                    </form>

                    {!isSignUp && (
                        <>
                            <div className="form-divider">
                                <span>or continue with</span>
                            </div>
                            <button 
                                className="btn btn-google btn-lg" 
                                style={{ width: '100%' }} 
                                onClick={signInWithGoogle}
                                disabled={loading}
                            >
                                <Icons.Google />
                                Sign in with Google
                            </button>
                        </>
                    )}

                    <p className="form-footer">
                        {isSignUp ? (
                            <>Already have an account? <Link to="/auth/signin">Sign in</Link></>
                        ) : (
                            <>{"Don't have an account?"} <Link to="/auth/signup">Sign up</Link></>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
}

// Add Item Page Component
function AddItemPage({ user }) {
    const navigate = useNavigate();
    const [newItem, setNewItem] = useState({ 
        title: '', 
        description: '', 
        price: '', 
        location: '', 
        contactInfo: '', 
        imageBase64: '' 
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/auth/signin');
        }
    }, [user, navigate]);

    if (!user) return null;

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setNewItem({ ...newItem, imageBase64: reader.result });
            };
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addDoc(collection(firestore, 'items'), { 
                ...newItem, 
                owner: user.displayName, 
                ownerEmail: user.email, 
                timestamp: serverTimestamp() 
            });
            navigate('/');
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="main-content">
            <div className="container">
                <div className="form-container" style={{ maxWidth: '600px' }}>
                    <div className="form-card">
                        <div className="form-header">
                            <h2 className="form-title">List an Item</h2>
                            <p className="form-subtitle">Share what you want to sell with the Exeter community</p>
                        </div>

                        <form onSubmit={handleAddItem}>
                            <div className="form-group">
                                <label className="form-label">Title</label>
                                <input
                                    type="text"
                                    placeholder="What are you selling?"
                                    value={newItem.title}
                                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                    className="form-input"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    placeholder="Describe your item (condition, features, etc.)"
                                    value={newItem.description}
                                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                    className="form-textarea"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Price</label>
                                <input
                                    type="text"
                                    placeholder="Enter price (leave empty for free)"
                                    value={newItem.price}
                                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Location</label>
                                <input
                                    type="text"
                                    placeholder="Where can buyers pick it up?"
                                    value={newItem.location}
                                    onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Contact Info</label>
                                <input
                                    type="text"
                                    placeholder="How should buyers contact you?"
                                    value={newItem.contactInfo}
                                    onChange={(e) => setNewItem({ ...newItem, contactInfo: e.target.value })}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Photo</label>
                                <div className="form-file">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="form-file-input"
                                        id="image-upload"
                                    />
                                    <label htmlFor="image-upload" className="form-file-label">
                                        <Icons.Upload />
                                        <span className="form-file-text">
                                            <strong>Click to upload</strong> or drag and drop
                                            <br />PNG, JPG up to 10MB
                                        </span>
                                    </label>
                                </div>
                                {newItem.imageBase64 && (
                                    <div className="image-preview">
                                        <img src={newItem.imageBase64} alt="Preview" />
                                    </div>
                                )}
                            </div>

                            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                                {loading ? 'Posting...' : 'Post Listing'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}

// Edit Items Page Component
function EditItemsPage({ user, items }) {
    const navigate = useNavigate();
    const [editedItems, setEditedItems] = useState({});
    const [loadingId, setLoadingId] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate('/auth/signin');
        }
    }, [user, navigate]);

    if (!user) return null;

    const userItems = items.filter(item => item.ownerEmail === user.email);

    const handleInputChange = (id, field, value) => {
        setEditedItems(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value
            }
        }));
    };

    const handleUpdate = async (id) => {
        if (editedItems[id]) {
            setLoadingId(id);
            try {
                await updateDoc(doc(firestore, 'items', id), editedItems[id]);
                setEditedItems(prev => {
                    const newState = { ...prev };
                    delete newState[id];
                    return newState;
                });
            } catch (error) {
                alert(error.message);
            } finally {
                setLoadingId(null);
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this listing?')) {
            setLoadingId(id);
            try {
                await deleteDoc(doc(firestore, 'items', id));
            } catch (error) {
                alert(error.message);
            } finally {
                setLoadingId(null);
            }
        }
    };

    return (
        <main className="main-content">
            <div className="container">
                <div className="page-header">
                    <h2 className="page-title">My Listings</h2>
                    <p className="page-subtitle">Manage and edit your posted items</p>
                </div>

                {userItems.length === 0 ? (
                    <div className="empty-state">
                        <Icons.Package />
                        <h3 className="empty-state-title">No listings yet</h3>
                        <p className="empty-state-text">You haven't posted any items for sale.</p>
                        <Link to="/add-item" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                            <Icons.Plus />
                            Post Your First Item
                        </Link>
                    </div>
                ) : (
                    <div className="edit-items-list">
                        {userItems.map((item) => (
                            <div key={item.id} className="edit-item-card fade-in">
                                <div className="edit-item-header">
                                    <h3 className="edit-item-title">{item.title}</h3>
                                </div>
                                <div className="edit-item-body">
                                    <div className="form-group">
                                        <label className="form-label">Title</label>
                                        <input
                                            type="text"
                                            defaultValue={item.title}
                                            onChange={(e) => handleInputChange(item.id, 'title', e.target.value)}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Price</label>
                                        <input
                                            type="text"
                                            defaultValue={item.price || 'Free'}
                                            onChange={(e) => handleInputChange(item.id, 'price', e.target.value)}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group full-width">
                                        <label className="form-label">Description</label>
                                        <textarea
                                            defaultValue={item.description}
                                            onChange={(e) => handleInputChange(item.id, 'description', e.target.value)}
                                            className="form-textarea"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Location</label>
                                        <input
                                            type="text"
                                            defaultValue={item.location}
                                            onChange={(e) => handleInputChange(item.id, 'location', e.target.value)}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Contact Info</label>
                                        <input
                                            type="text"
                                            defaultValue={item.contactInfo}
                                            onChange={(e) => handleInputChange(item.id, 'contactInfo', e.target.value)}
                                            className="form-input"
                                        />
                                    </div>
                                    {item.imageBase64 && (
                                        <div className="edit-item-image">
                                            <img src={item.imageBase64} alt={item.title} />
                                        </div>
                                    )}
                                </div>
                                <div className="edit-item-actions">
                                    <button 
                                        className="btn btn-primary" 
                                        onClick={() => handleUpdate(item.id)}
                                        disabled={loadingId === item.id || !editedItems[item.id]}
                                    >
                                        <Icons.Check />
                                        {loadingId === item.id ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button 
                                        className="btn btn-danger" 
                                        onClick={() => handleDelete(item.id)}
                                        disabled={loadingId === item.id}
                                    >
                                        <Icons.Trash />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

// Main App Component
function App() {
    const [user, setUser] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listen for auth state changes
        const unsubscribeAuth = auth.onAuthStateChanged((user) => {
            setUser(user);
        });

        // Listen for items changes
        const unsubscribeItems = onSnapshot(collection(firestore, 'items'), (snapshot) => {
            const itemsData = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
            // Sort by timestamp (newest first)
            itemsData.sort((a, b) => {
                if (!a.timestamp || !b.timestamp) return 0;
                return b.timestamp.seconds - a.timestamp.seconds;
            });
            setItems(itemsData);
            setLoading(false);
        });

        return () => {
            unsubscribeAuth();
            unsubscribeItems();
        };
    }, []);

    const handleSignOut = () => {
        firebaseSignOut(auth);
        setUser(null);
    };

    if (loading) {
        return (
            <div className="app">
                <div className="loading">
                    <div className="loading-spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <Router>
            <div className="app">
                <Header user={user} onSignOut={handleSignOut} />
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

export default App;
