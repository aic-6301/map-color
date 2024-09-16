import React, { useState } from 'react';
import { Checkbox, FormControl, InputLabel, MenuItem, Select, TextField, List, ListItem, ListItemText, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, ListItemButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface SidebarProps {
  cities: string[];
  selectedCities: string[];
  onCitySelect: (cityName: string) => void;
  searchTerm: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  sidebarOpen: boolean;
  onColorChange: (cityName: string, color: string) => void;
  cityColors: { [key: string]: string };
}

const Sidebar: React.FC<SidebarProps> = ({
  cities,
  selectedCities,
  onCitySelect,
  searchTerm,
  onSearchChange,
  sidebarOpen,
  onColorChange,
  cityColors
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [localSearchTerm, setLocalSearchTerm] = useState<string>(''); // ローカルな検索用の状態を追加
  const colors = [
    { name: '赤', code: '#FF0000' },
    { name: '緑', code: '#00FF00' },
    { name: '青', code: '#0000FF' },
    { name: '黄色', code: '#FFFF00' },
    { name: 'マゼンタ', code: '#FF00FF' },
    { name: 'シアン', code: '#00FFFF' },
    { name: '茶色', code: '#A52A2A' },
    { name: 'オリーブ', code: '#808000' },
    { name: 'ティール', code: '#008080' },
    { name: '紫', code: '#800080' }
  ];

  const handleDialogOpen = () => {
    setDialogOpen(true);
    setLocalSearchTerm(''); // ダイアログを開くときにローカルな検索用の状態をクリア
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedCity(''); // ダイアログを閉じる際に選択された市をクリア
  };

  const handleCityAdd = () => {
    if (selectedCity) {
      onCitySelect(selectedCity);
      setDialogOpen(false);
      setSelectedCity(''); // 市を追加した後に選択された市をクリア
    }
  };

  const handleLocalSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(event.target.value);
  };

  const handleCityRemove = (city: string) => {
    onCitySelect(city); // 選択を解除することで削除
  };

  return (
    <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      <h3>市の選択</h3>
      <Button variant="contained" color="primary" onClick={handleDialogOpen}>
        市を追加
      </Button>
      <List>
        {selectedCities.map((city, index) => (
          <ListItem key={`${city}-${index}`}>
            <ListItemText primary={city} />
            <Box sx={{ minWidth: 120 }}>
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel>色</InputLabel>
                <Select
                  value={cityColors[city] || ''}
                  onChange={(e) => onColorChange(city, e.target.value)}
                  label="色"
                >
                  {colors.map((color, idx) => (
                    <MenuItem key={idx} value={color.code}>
                      {color.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <IconButton edge="end" aria-label="delete" onClick={() => handleCityRemove(city)}>
              <DeleteIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>市を選択</DialogTitle>
        <DialogContent>
          <TextField
            label="検索"
            variant="outlined"
            value={localSearchTerm}
            onChange={handleLocalSearchChange}
            fullWidth
            margin="normal"
          />
          <List>
            {cities.filter(city => city.toLowerCase().includes(localSearchTerm.toLowerCase())).map((city, index) => (
              <ListItemButton
                key={`${city}-${index}`}
                onClick={() => setSelectedCity(city)}
                selected={selectedCity === city} // 選択された市をハイライト
                sx={{
                  userSelect: 'none', // 文字選択を無効化
                  backgroundColor: selectedCity === city ? 'rgba(0, 0, 0, 0.08)' : 'transparent' // 選択時に灰色っぽくハイライト
                }}
              >
                <ListItemText primary={city} />
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            キャンセル
          </Button>
          <Button onClick={handleCityAdd} color="primary">
            追加
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Sidebar;