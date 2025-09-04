import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import { Add, Inventory, Assessment } from '@mui/icons-material';

const QuickActions = () => {
  const actions = [
    {
      title: 'Add New Item',
      icon: <Add fontSize="large" />,
      color: '#1976d2',
      onClick: () => console.log('Add new item clicked')
    },
    {
      title: 'View Inventory',
      icon: <Inventory fontSize="large" />,
      color: '#2e7d32',
      onClick: () => console.log('View inventory clicked')
    },
    {
      title: 'Generate Report',
      icon: <Assessment fontSize="large" />,
      color: '#ed6c02',
      onClick: () => console.log('Generate report clicked')
    }
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          {actions.map((action, index) => (
            <Grid item xs={4} key={index}>
              <Box
                sx={{
                  textAlign: 'center',
                  padding: 2,
                  borderRadius: 2,
                  backgroundColor: `${action.color}15`,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: `${action.color}25`
                  }
                }}
                onClick={action.onClick}
              >
                <Box sx={{ color: action.color, mb: 1 }}>
                  {action.icon}
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  {action.title}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default QuickActions;