const express = require('express');
const router = express.Router();
const db = require('../../config/db'); 

// GET all amenities (With Smart Availability Logic)
router.get('/', async (req, res) => {
  try {
    // 1. QUERY: Select amenities + Count bookings for TODAY
    const query = `
      SELECT a.*, 
      (SELECT COUNT(*) FROM ReservationDb b 
       WHERE b.amenity_id = a.id 
       AND b.date = CURDATE() 
       AND b.status IN ('Confirmed', 'Checked-In')) as booked_today
      FROM AmenitiesDb a 
      ORDER BY a.id DESC
    `;

    const [rows] = await db.query(query); // Using db.query for mysql2/promise
    
    const amenities = rows.map(amenity => {
      // --- AVAILABILITY LOGIC ---
      
      // 1. Kunin ang Total Quantity (Default to 0 if null)
      const totalQuantity = amenity.quantity ? parseInt(amenity.quantity) : 0; 

      // 2. Kunin ang Bookings Ngayon
      const currentBooked = amenity.booked_today || 0;

      // 3. Check kung PUNO na
      const isFullyBooked = currentBooked >= totalQuantity;

      // 4. Check ang Manual Switch sa Database ('Yes'/'No')
      // Note: Adjusted to check for 'Yes' string specifically or 1
      const isManuallyAvailable = (amenity.available === 'Yes' || amenity.available === 1);

      // 5. FINAL STATUS
      const finalAvailable = isManuallyAvailable && !isFullyBooked;

      return {
        id: amenity.id,
        name: amenity.name,
        type: amenity.type || 'General',
        description: amenity.description,
        capacity: amenity.capacity,
        price: parseFloat(amenity.price),
        // Ipadala ang Final Status: "Yes" kung available, "No" kung hindi
        available: finalAvailable ? 'Yes' : 'No', 
        quantity: totalQuantity,
        remaining: Math.max(0, totalQuantity - currentBooked),
        // IMPORTANT: Filename lang ang ipadala! Ang Frontend na ang bahalang magdugtong ng URL.
        image: amenity.image 
      };
    });
    
    res.json(amenities);

  } catch (error) {
    console.error('Error fetching amenities:', error);
    res.status(500).json({ error: 'Failed to fetch amenities' });
  }
});

// GET single amenity
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT a.*, 
      (SELECT COUNT(*) FROM ReservationDb b 
       WHERE b.amenity_id = a.id 
       AND b.date = CURDATE() 
       AND b.status IN ('Confirmed', 'Checked-In')) as booked_today
      FROM AmenitiesDb a 
      WHERE a.id = ?
    `;

    const [rows] = await db.query(query, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Amenity not found' });
    }
    
    const amenity = rows[0];

    // Logic consistency
    const totalQuantity = amenity.quantity ? parseInt(amenity.quantity) : 0;
    const currentBooked = amenity.booked_today || 0;
    const isFullyBooked = currentBooked >= totalQuantity;
    const isManuallyAvailable = (amenity.available === 'Yes' || amenity.available === 1);
    const finalAvailable = isManuallyAvailable && !isFullyBooked;
    
    res.json({
      id: amenity.id,
      name: amenity.name,
      type: amenity.type,
      description: amenity.description,
      capacity: amenity.capacity,
      price: parseFloat(amenity.price),
      available: finalAvailable ? 'Yes' : 'No',
      quantity: totalQuantity,
      remaining: Math.max(0, totalQuantity - currentBooked),
      image: amenity.image // Filename only!
    });

  } catch (error) {
    console.error('Error fetching amenity:', error);
    res.status(500).json({ error: 'Failed to fetch amenity' });
  }
});

module.exports = router;
