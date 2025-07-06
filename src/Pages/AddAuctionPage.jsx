import React from 'react'
import AddAuctionForm from '../components/addAuction/addAuctionForm';
function AddAuctionPage() {
  const bgStyle ={
    backgroundColor: '#f1f1f1',
    padding: '40px 56px'
  };

  return (
    <div style={bgStyle}>
      <AddAuctionForm/>
    </div>
  )
}

export default AddAuctionPage