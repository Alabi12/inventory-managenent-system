import React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText, ListItemIcon, Chip } from '@mui/material';
import { Warning } from '@mui/icons-material';

const LowStockAlert = () => {
  const lowStockItems = [
    { id: 1, name: 'iPhone 13', currentStock: 2, minStock: 5 },
    { id: 2, name: 'MacBook Pro', currentStock: 3, minStock: 5 },
    { id: 3, name: 'AirPods', currentStock: 4, minStock: 10 },
    { id: 4, name: 'iPad Air', currentStock: 1, minStock: 3 },
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Low Stock Alerts
        </Typography>
        <List>
          {lowStockItems.map((item) => (
            <ListItem key={item.id} divider>
              <ListItemIcon>
                <Warning color="warning" />
              </ListItemIcon>
              <ListItemText
                primary={item.name}
                secondary={`Current: ${item.currentStock} | Minimum: ${item.minStock}`}
              />
              <Chip
                label="Low Stock"
                color="warning"
                size="small"
                variant="outlined"
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default LowStockAlert;