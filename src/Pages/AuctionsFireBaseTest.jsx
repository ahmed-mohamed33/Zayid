import React, { useState, useEffect } from 'react'
import { db } from '../config/Firebase'
import { collection, getDocs, addDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore'

function AuctionsFireBaseTest() {
    const [auctions, setAuctions] = useState([]);
    const [title, setTitle] = useState('');
    const [startPrice, setStartPrice] = useState('');
    const [endDate, setEndDate] = useState('');
    const [startDate, setStartDate] = useState('');
    const getAuctions = async () => {
        const auctionsRef = collection(db, 'Auctions');
        const querySnapshot = await getDocs(auctionsRef);
        const auctions = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
        setAuctions(auctions);
    }
    
    useEffect(() => {
        getAuctions();
    }, []);

    const addAuction = async () => {
        try {
            const auctionsRef = collection(db, 'Auctions');
            await addDoc(auctionsRef, {
                title: title,
                startPrice: startPrice,
                endDate: Timestamp.fromDate(new Date(endDate)),
                startDate: Timestamp.fromDate(new Date(startDate))
            });
            getAuctions();
        } catch (error) {

      
        
        }
    }
    const deleteAuction = async (id) => {
        const auctionsRef = collection(db, 'Auctions');
        await deleteDoc(doc(auctionsRef, id));
        getAuctions();
    }

    const formatFirestoreDate = (firestoreDate) => {
        if (!firestoreDate) return 'No date';
        if (firestoreDate instanceof Timestamp) {
            return firestoreDate.toDate().toLocaleString();
        }
        return new Date(firestoreDate).toLocaleString();
    }

    return (
        <div className='flex flex-col items-center justify-center h-screen'>
            <h1 className='text-2xl font-bold'>Auctions</h1>
            {auctions.map((auction) => (
                <div key={auction.id} className='flex flex-col items-center justify-center h-screen'>
                    <h2 className='text-2xl font-bold'>{auction.title}</h2>
                    <p className='text-sm text-gray-500'>Start Price: {auction.startPrice}</p>
                    <p className='text-sm text-gray-500'>End Date: {formatFirestoreDate(auction.endDate)}</p>
                    <p className='text-sm text-gray-500'>Start Date: {formatFirestoreDate(auction.startDate)}</p>
                    <button onClick={() => deleteAuction(auction.id)}>Delete</button>
                </div>
            ))}
            <div className='flex flex-col items-center justify-center h-screen'>
                <input type="text" placeholder='Title' value={title} onChange={(e) => setTitle(e.target.value)} />
                <input type="number" placeholder='Start Price' value={startPrice} onChange={(e) => setStartPrice(e.target.value)} />
                <input type="datetime-local" placeholder='End Date' value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                <input type="datetime-local" placeholder='Start Date' value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <button onClick={addAuction}>Add Auction</button>
            </div>
        </div>
    )
}

export default AuctionsFireBaseTest