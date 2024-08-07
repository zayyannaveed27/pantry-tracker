'use client';
import Image from "next/image";
import { useState, useEffect } from "react";
import {firestore} from '@/firebase';
import {Box, Modal, Stack, Typography, TextField, Button} from '@mui/material';
import {collection, query, doc, getDocs, getDoc, setDoc, deleteDoc} from "firebase/firestore";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(true);
  const [itemName, setItemName] = useState('');

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach(doc => {
      inventoryList.push(
        {
          name: doc.id,
          ...doc.data(),
        }
      )
    });
    setInventory(inventoryList);
  }

  const addItem = async (item) => {
    // Add the item to the inventory
    // Update the inventory state
    // Call updateInventory

    const docRef = doc(firestore, 'inventory', item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const {quantity} = docSnap.data();
      await setDoc(docRef, {quantity: quantity + 1});
    }
    else {
      await setDoc(docRef, {quantity: 1});
    }

    await updateInventory();
  }

  const removeItem = async (item) => {
    // Remove the item from the inventory
    // Update the inventory state
    // Call updateInventory

    const docRef = doc(firestore, 'inventory', item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const {quantity} = docSnap.data();
      if (quantity > 1) {
        await setDoc(docRef, {quantity: quantity - 1});
      } else {
      await deleteDoc(docRef);
      }
    }

    await updateInventory();
  }

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    updateInventory();
  }, []);

  return (
  <Box 
    width="100vw" 
    height="100vh" 
    display="flex" 
    flexDirection="column"
    justifyContent="center" 
    alignItems="center"
    gap={2}
  >
    <Modal open={open} onClose={handleClose}>
      <Box 
        position="absolute" 
        top="50%" 
        left="50%" 
        width={400} 
        bgcolor={"white"} 
        border="2px solid #000"
        boxShadow={24}
        p={4}
        display={"flex"}
        flexDirection="column"
        gap={3}
        sx = {{
          transform:"translate(-50%,-50%)", 
        }}
      >
        <Typography variant="h6">Add Item</Typography>
        <Stack width="100%" direction="row" spacing={2}>
          <TextField 
            variant="outlined"
            fullWidth
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
          <Button 
            variant='outlined' 
            onClick={() => {
              addItem(itemName);
              setItemName('');
              handleClose();
            }}
          >Add</Button>
        </Stack>
      </Box>
    </Modal>
    <Button 
      variant='outlined' 
      onClick={handleOpen}
    >Add new item</Button>
    <Box border="1px solid #333">
      <Box width="800px" height="100px" bgcolor={"#ADD8E6"} display="flex" alignItems="center" justifyContent="center">
        <Typography variant = "h3" color="#333">Inventory Items</Typography>
      </Box>
    
      <Stack width = "800px" height="300px" spacing={2} overflow="auto">
        {
          inventory.map(({name, quantity}) => (
            <Box 
              key={name} 
              width="100%"
              minHeight="80px" 
              display="flex" 
              justifyContent="space-between" 
              alignItems="center" 
              p={2}
              // bgcolor={"#f0f0f0"}
            >
              <Typography variant="h5" color="#333">{name.charAt(0).toUpperCase() + name.slice(1)}</Typography>
              <Typography variant="h5">{quantity}</Typography>
              <Stack direction="row" spacing={2}>
                <Button variant="contained" onClick={() => addItem(name)}>Add</Button>
                <Button variant="contained" onClick={() => removeItem(name)}>Remove</Button>
              </Stack>
            </Box>
          ))
        }
      </Stack>
    </Box>
  </Box>
  );
}
