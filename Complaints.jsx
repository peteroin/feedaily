import React, { useState, useEffect } from 'react';
const mockDb = {
    collection: () => ({
        add: () => Promise.resolve({ id: `COMPLAINT-${Math.random().toString(36).substr(2, 9).toUpperCase()}` }),
        where: () => ({
            onSnapshot: (callback) => {
                // Simulate fetching complaints
                const mockComplaints = [
                    { id: 'CMPT001', complaintId: 'CMPT001', userName: 'John Doe', category: 'Delivery Buddy', subjectName: 'Delivery Person A', status: 'Complain Initiated', description: 'Late delivery.', createdAt: { toDate: () => new Date() } },
                    { id: 'CMPT002', complaintId: 'CMPT002', userName: 'Jane Smith', category: 'Donor', subjectName: 'Donor B', status: 'Resolved', description: 'Food quality was not good.', createdAt: { toDate: () => new Date() } },
                ];
                callback({ docs: mockComplaints.map(doc => ({ id: doc.id, data: () => doc })) });
                return () => { }; // Unsubscribe function
            }
        }),
        doc: (id) => ({
            update: (data) => Promise.resolve(console.log(`Updated doc ${id} with`, data))
        })
    })
};

const mockAuth = {
    currentUser: {
        uid: 'USER123',
        displayName: 'John Doe',
        email: 'john.doe@example.com', // Assuming email as contact
    }
};

const mockStorage = {
    ref: () => ({
        put: () => Promise.resolve({
            ref: {
                getDownloadURL: () => Promise.resolve('https://placehold.co/600x400/EEE/31343C?text=Uploaded_Proof.jpg')
            }
        })
    })
};

// Replace these mocks with your actual firebase instances
const db = mockDb;
const auth = mockAuth;
const storage = mockStorage;
// End Mock Firebase

// --- HELPER COMPONENTS ---

const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-xl shadow-lg p-6 sm:p-8 ${className}`}>
        {children}
    </div>
);

const Input = ({ id, label, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input id={id} {...props} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150" />
    </div>
);

const Select = ({ id, label, children, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select id={id} {...props} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150">
            {children}
        </select>
    </div>
);

const Textarea = ({ id, label, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <textarea id={id} {...props} rows="4" className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"></textarea>
    </div>
);

const Button = ({ children, onClick, type = 'button', variant = 'primary', disabled = false }) => {
    const baseClasses = "w-full font-semibold py-2.5 px-5 rounded-lg focus:outline-none focus:ring-4 transition duration-300 ease-in-out";
    const variantClasses = {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-300',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
    };
    const disabledClasses = 'disabled:bg-gray-300 disabled:cursor-not-allowed';
    return (
        <button type={type} onClick={onClick} disabled={disabled} className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses}`}>
            {children}
        </button>
    );
};

const Spinner = () => (
    <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
);

// --- MAIN COMPLAINT FORM COMPONENT ---

const ComplaintForm = ({ user, onComplaintFiled }) => {
    const [category, setCategory] = useState('');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [proof, setProof] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [associatedPeople, setAssociatedPeople] = useState([]);
    const [isFetchingPeople, setIsFetchingPeople] = useState(false);

    // This effect simulates fetching associated donors or delivery buddies
    // based on the user's past interactions when the category changes.
    useEffect(() => {
        if (!category || category === 'platform' || category === 'other') {
            setAssociatedPeople([]);
            setSubject('');
            return;
        }

        const fetchAssociatedPeople = async () => {
            setIsFetchingPeople(true);
            // In a real app, you would query Firestore to find donors/buddies
            // linked to the current user's past orders/donations.
            console.log(`Fetching ${category}s associated with user ${user.uid}...`);
            await new Promise(res => setTimeout(res, 1000)); // Simulate network delay

            let mockData = [];
            if (category === 'donor') {
                mockData = [
                    { id: 'DONOR1', name: 'Healthy Eats Restaurant' },
                    { id: 'DONOR2', name: 'Community Bakery' },
                ];
            } else if (category === 'delivery_buddy') {
                mockData = [
                    { id: 'BUDDY1', name: 'Mike Wheeler' },
                    { id: 'BUDDY2', name: 'Lucas Sinclair' },
                ];
            }
            setAssociatedPeople(mockData);
            setIsFetchingPeople(false);
        };

        fetchAssociatedPeople();
    }, [category, user.uid]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.size < 5 * 1024 * 1024) { // 5MB limit
            setProof(file);
            setError('');
        } else {
            setProof(null);
            setError('File is too large or invalid. Max 5MB.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!category || !description) {
            setError('Category and description are required.');
            return;
        }
        if ((category === 'donor' || category === 'delivery_buddy') && !subject) {
            setError('Please select the person you are complaining about.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            let proofUrl = '';
            if (proof) {
                // Upload proof to Firebase Storage
                const storageRef = mockStorage.ref(`complaints/${user.uid}/${Date.now()}-${proof.name}`);
                const snapshot = await storageRef.put(proof);
                proofUrl = await snapshot.ref.getDownloadURL();
            }

            // Add complaint to Firestore
            const complaintData = {
                userId: user.uid,
                userName: user.displayName,
                userContact: user.email,
                category: category,
                subjectId: subject,
                subjectName: associatedPeople.find(p => p.id === subject)?.name || 'N/A',
                description: description,
                proofUrl: proofUrl,
                status: 'Complain Initiated',
                createdAt: new Date(),
            };
            
            const docRef = await db.collection('complaints').add(complaintData);
            const complaintId = docRef.id;
            
            onComplaintFiled({ ...complaintData, complaintId });
            
            // Reset form
            setCategory('');
            setSubject('');
            setDescription('');
            setProof(null);

        } catch (err) {
            console.error("Error submitting complaint:", err);
            setError('Failed to submit complaint. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">File a Complaint</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input id="name" label="Full Name" type="text" value={user.displayName} disabled />
                    <Input id="contact" label="Contact" type="text" value={user.email} disabled />
                </div>
                
                <Select id="category" label="Complaint About" value={category} onChange={(e) => setCategory(e.target.value)} required>
                    <option value="">-- Select a Category --</option>
                    <option value="donor">Donor</option>
                    <option value="delivery_buddy">Delivery Buddy</option>
                    <option value="platform">Platform</option>
                    <option value="other">Other</option>
                </Select>

                {(category === 'donor' || category === 'delivery_buddy') && (
                    isFetchingPeople ? <Spinner /> : associatedPeople.length > 0 && (
                        <Select id="subject" label={`Select ${category === 'donor' ? 'Donor' : 'Delivery Buddy'}`} value={subject} onChange={(e) => setSubject(e.target.value)} required>
                            <option value="">-- Select Person --</option>
                            {associatedPeople.map(person => (
                                <option key={person.id} value={person.id}>{person.name}</option>
                            ))}
                        </Select>
                    )
                )}

                <Textarea id="description" label="Details of Complaint" value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Please provide as much detail as possible..." />
                
                <div>
                    <label htmlFor="proof" className="block text-sm font-medium text-gray-700 mb-1">Upload Proof (Optional)</label>
                    <input type="file" id="proof" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, PDF up to 5MB.</p>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <div className="pt-2">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? <Spinner /> : 'Submit Complaint'}
                    </Button>
                </div>
            </form>
        </Card>
    );
};

// --- USER'S COMPLAINT TRACKING COMPONENT ---

const TrackComplaints = ({ user }) => {
    const [complaints, setComplaints] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch complaints for the current user in real-time
        const q = db.collection('complaints').where('userId', '==', user.uid);
        const unsubscribe = q.onSnapshot(querySnapshot => {
            const userComplaints = [];
            querySnapshot.forEach(doc => {
                userComplaints.push({ id: doc.id, ...doc.data() });
            });
            // Sort by most recent
            userComplaints.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
            setComplaints(userComplaints);
            setIsLoading(false);
        }, err => {
            console.error("Error fetching complaints:", err);
            setError('Could not fetch your complaints.');
            setIsLoading(false);
        });

        return () => unsubscribe(); // Cleanup listener on unmount
    }, [user.uid]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Complain Initiated': return 'bg-blue-100 text-blue-800';
            case 'In Progress': return 'bg-yellow-100 text-yellow-800';
            case 'Resolved': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    if (isLoading) return <Spinner />;
    if (error) return <p className="text-red-500 text-center">{error}</p>;

    return (
         <Card>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Track Your Complaints</h2>
            {complaints.length === 0 ? (
                <p className="text-center text-gray-500">You have not filed any complaints yet.</p>
            ) : (
                <ul className="space-y-4">
                    {complaints.map(c => (
                        <li key={c.id} className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                                <div>
                                    <p className="font-bold text-gray-700">ID: {c.complaintId || c.id}</p>
                                    <p className="text-sm text-gray-600">Against: {c.category} ({c.subjectName})</p>
                                    <p className="text-xs text-gray-400">Filed on: {c.createdAt.toDate().toLocaleDateString()}</p>
                                </div>
                                <div className={`text-sm font-medium px-3 py-1 rounded-full mt-2 sm:mt-0 ${getStatusColor(c.status)}`}>
                                    {c.status}
                                </div>
                            </div>
                             <p className="text-sm text-gray-600 mt-3 pt-3 border-t border-gray-100">Details: {c.description}</p>
                        </li>
                    ))}
                </ul>
            )}
        </Card>
    );
};

// --- ADMIN PANEL FOR COMPLAINTS ---

const AdminComplaintsView = () => {
    const [complaints, setComplaints] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    useEffect(() => {
        // Admin fetches all complaints
        const unsubscribe = db.collection('complaints').onSnapshot(querySnapshot => {
            const allComplaints = [];
            querySnapshot.forEach(doc => {
                allComplaints.push({ id: doc.id, ...doc.data() });
            });
             allComplaints.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
            setComplaints(allComplaints);
            setIsLoading(false);
        }, err => {
            console.error("Error fetching all complaints:", err);
            setError('Could not fetch complaints.');
            setIsLoading(false);
        });
        
        return () => unsubscribe();
    }, []);

    const handleStatusChange = async (id, newStatus) => {
        try {
            const complaintRef = db.collection('complaints').doc(id);
            await complaintRef.update({ status: newStatus });
        } catch (err) {
            console.error("Error updating status:", err);
            alert('Failed to update status.');
        }
    };
    
    if (isLoading) return <Spinner />;
    if (error) return <p className="text-red-500 text-center">{error}</p>;

    return (
        <Card>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin - Manage Complaints</h2>
             <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Complaint ID</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">User</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Category</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Details</th>
                             <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Proof</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Status</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {complaints.map(c => (
                            <tr key={c.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="py-3 px-4">{c.complaintId || c.id}</td>
                                <td className="py-3 px-4">{c.userName}</td>
                                <td className="py-3 px-4">{c.category}</td>
                                <td className="py-3 px-4 text-sm">{c.description}</td>
                                <td className="py-3 px-4">
                                    {c.proofUrl ? <a href={c.proofUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">View</a> : 'N/A'}
                                </td>
                                <td className="py-3 px-4">
                                     <select value={c.status} onChange={(e) => handleStatusChange(c.id, e.target.value)} className="w-full p-1.5 border-gray-300 rounded-md text-sm">
                                        <option>Complain Initiated</option>
                                        <option>In Progress</option>
                                        <option>Resolved</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        </Card>
    );
};


// --- MAIN PARENT COMPONENT TO MANAGE VIEWS ---
export default function ComplaintSystem() {
    // This state would typically be managed by your app's routing
    const [activeView, setActiveView] = useState('fileComplaint');
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [newComplaintId, setNewComplaintId] = useState('');

    // A mock user object. In your app, this would come from your auth context.
    const user = mockAuth.currentUser; 
    
    // This is a mock admin check. Implement your own logic.
    const isAdmin = user && user.email.endsWith('@admin.feedaily.com');

    const handleComplaintFiled = (complaint) => {
        setNewComplaintId(complaint.complaintId);
        setShowSuccessMessage(true);
        setActiveView('trackComplaints'); // Switch view after filing
        setTimeout(() => setShowSuccessMessage(false), 5000); // Hide message after 5s
    };
    
    // If no user is logged in, show a login prompt.
    if (!user) {
        return (
            <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
                <Card className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
                    <p className="text-gray-600 mb-6">You must be logged in to file or track a complaint.</p>
                    <Button onClick={() => alert('Redirecting to login...')}>Login</Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 font-sans p-4 sm:p-6 lg:p-8 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-indigo-600">Complaint Portal</h1>
                    <p className="text-gray-500 mt-2">We are here to help. Lodge and track your complaints.</p>
                </header>
                
                {/* View Toggling Buttons */}
                <div className="flex justify-center space-x-2 mb-8 bg-white p-2 rounded-xl shadow-sm">
                    <button onClick={() => setActiveView('fileComplaint')} className={`px-4 py-2 text-sm font-semibold rounded-lg ${activeView === 'fileComplaint' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                        File Complaint
                    </button>
                    <button onClick={() => setActiveView('trackComplaints')} className={`px-4 py-2 text-sm font-semibold rounded-lg ${activeView === 'trackComplaints' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                        Track Complaints
                    </button>
                     {isAdmin && (
                        <button onClick={() => setActiveView('adminView')} className={`px-4 py-2 text-sm font-semibold rounded-lg ${activeView === 'adminView' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                            Admin Panel
                        </button>
                    )}
                </div>

                {showSuccessMessage && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-6" role="alert">
                        <p className="font-bold">Success!</p>
                        <p>Your complaint has been filed. Your Complaint Number is: <span className="font-mono">{newComplaintId}</span></p>
                    </div>
                )}

                {/* Render active view */}
                <main>
                    {activeView === 'fileComplaint' && <ComplaintForm user={user} onComplaintFiled={handleComplaintFiled} />}
                    {activeView === 'trackComplaints' && <TrackComplaints user={user} />}
                    {activeView === 'adminView' && isAdmin && <AdminComplaintsView />}
                </main>
            </div>
        </div>
    );
}
