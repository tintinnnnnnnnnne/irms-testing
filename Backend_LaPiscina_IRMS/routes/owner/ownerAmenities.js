const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs'); 
const db = require('../../config/db'); // Database config
const upload = require('../../middleware/upload'); 

// GET All Amenities
router.get('/', async (req, res) => {
  try {
    // Kukunin natin ang amenities at bibilangin ang bookings ngayon
    const query = `
      SELECT a.*, 
      (SELECT COUNT(*) FROM ReservationDb b 
       WHERE b.amenity_id = a.id 
       AND b.date = DATE(CONVERT_TZ(NOW(), '+00:00', '+08:00')) 
       AND b.status IN ('Confirmed', 'Checked-In')) as booked_today
      FROM AmenitiesDb a 
      ORDER BY a.id DESC
    `;
    
    // FIX: db.query instead of db.execute
    const [amenities] = await db.query(query);
    
    const formattedAmenities = amenities.map(amenity => {
      // FIX: Filename ONLY. Let frontend handle the URL.
      const imageFilename = amenity.image || 'default.jpg';
      
      // Logic: Check quantity
      const totalQuantity = (amenity.quantity !== undefined && amenity.quantity !== null) 
                            ? parseInt(amenity.quantity) 
                            : 0;

      const currentBooked = amenity.booked_today || 0;
      const isFullyBooked = currentBooked >= totalQuantity;

      // Manual Switch Check
      const isManuallyAvailable = (amenity.available === 'Yes' || amenity.available === 1 || amenity.available === 'true');

      // Final Check
      const finalAvailable = isManuallyAvailable && !isFullyBooked;
      
      return {
        id: amenity.id,
        name: amenity.name,
        type: amenity.type || 'General',
        description: amenity.description,
        capacity: amenity.capacity,
        price: parseFloat(amenity.price),
        quantity: totalQuantity, 
        booked: currentBooked,
        available: finalAvailable,
        image: imageFilename // Raw filename only!
      };
    });
    
    res.json({ amenities: formattedAmenities });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error fetching amenities', amenities: [] });
  }
});

// POST New Amenity
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category, status, capacity, quantity } = req.body;
    
    const finalType = category || req.body.type || 'kubo';
    const imageFilename = req.file ? req.file.filename : 'default.jpg';
    const available = (status === 'available' || status === 'true') ? 'Yes' : 'No';
    
    // Validating Quantity
    const finalQuantity = (quantity !== undefined && quantity !== '') ? parseInt(quantity) : 0;
    
    const [result] = await db.query(
      'INSERT INTO AmenitiesDb (image, name, type, description, capacity, price, available, quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [imageFilename, name, finalType, description, capacity, price, available, finalQuantity]
    );
    
    res.json({ message: 'Amenity added successfully', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Error adding amenity: ' + error.message });
  }
});

// PUT Update Amenity
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, status, capacity, quantity } = req.body;
    
    const finalType = category || req.body.type || 'kubo';
    const available = (status === 'available' || status === 'true') ? 'Yes' : 'No';
    const finalQuantity = (quantity !== undefined && quantity !== '') ? parseInt(quantity) : 0;

    if (req.file) {
      // Delete old image logic
      const [rows] = await db.query('SELECT image FROM AmenitiesDb WHERE id = ?', [id]);
      if (rows.length > 0) {
          const oldImage = rows[0].image;
          if (oldImage && oldImage !== 'default.jpg' && !oldImage.startsWith('http')) {
              const oldPath = path.join(__dirname, '../../uploads/am_images', oldImage);
              if (fs.existsSync(oldPath)) {
                  try { fs.unlinkSync(oldPath); } catch(err) { console.error(err); }
              }
          }
      }

      await db.query(
        'UPDATE AmenitiesDb SET name=?, description=?, price=?, type=?, available=?, capacity=?, quantity=?, image=? WHERE id=?',
        [name, description, price, finalType, available, capacity, finalQuantity, req.file.filename, id]
      );
    } else {
      await db.query(
        'UPDATE AmenitiesDb SET name=?, description=?, price=?, type=?, available=?, capacity=?, quantity=? WHERE id=?',
        [name, description, price, finalType, available, capacity, finalQuantity, id]
      );
    }
    
    res.json({ message: 'Amenity updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating amenity: ' + error.message });
  }
});

// DELETE Amenity
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT image FROM AmenitiesDb WHERE id = ?', [id]);
    if (rows.length > 0) {
        const imageFilename = rows[0].image;
        if (imageFilename && imageFilename !== 'default.jpg' && !imageFilename.startsWith('http')) {
            const filePath = path.join(__dirname, '../../uploads/am_images', imageFilename);
            if (fs.existsSync(filePath)) fs.unlink(filePath, (err) => { if (err) console.error(err); });
        }
    }
    await db.query('DELETE FROM AmenitiesDb WHERE id = ?', [id]);
    res.json({ message: 'Amenity deleted successfully' });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: 'Error deleting amenity' });
  }
});

module.exports = router;