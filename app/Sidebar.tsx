import React, { useState, useRef, useEffect } from 'react';
import { FormControl, InputLabel, MenuItem, Select, TextField, List, ListItem, ListItemText, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, ListItemButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface SidebarProps {
  cities: string[];
  prefectures: string[];
  selectedCities: string[];
  selectedPrefectures: string[];
  onCitySelect: (cityName: string) => void;
  onPrefectureSelect: (prefectureName: string) => void;
  searchTerm: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  sidebarOpen: boolean;
  onColorChange: (name: string, color: string) => void;
  cityColors: { [key: string]: string };
  selectedLayer: string;
  onLayerChange: (layer: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  cities,
  prefectures,
  selectedCities,
  selectedPrefectures,
  onCitySelect,
  onPrefectureSelect,
  searchTerm,
  onSearchChange,
  sidebarOpen,
  onColorChange,
  cityColors,
  selectedLayer,
  onLayerChange
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCitiesInDialog, setSelectedCitiesInDialog] = useState<string[]>([]);
  const [selectedPrefecturesInDialog, setSelectedPrefecturesInDialog] = useState<string[]>([]);
  const [localSearchTerm, setLocalSearchTerm] = useState<string>('');
  const [isCityDialog, setIsCityDialog] = useState<boolean>(true);
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
    { name: '紫', code: '#800080' },
    { name: '黒', code: '#000000' },
    { name: '灰色', code: '#808080' },
    { name: '銀色', code: '#C0C0C0' },
    { name: '白', code: '#FFFFFF' },
  ];

  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = (event: Event) => {
      event.stopPropagation();
    };

    const sidebarElement = sidebarRef.current;
    if (sidebarElement) {
      sidebarElement.addEventListener('wheel', handleScroll, { passive: false });
    }

    return () => {
      if (sidebarElement) {
        sidebarElement.removeEventListener('wheel', handleScroll);
      }
    };
  }, []);

  const handleDialogOpen = (isCity: boolean) => {
    setIsCityDialog(isCity);
    setDialogOpen(true);
    setLocalSearchTerm('');
    setSelectedCitiesInDialog([]);
    setSelectedPrefecturesInDialog([]);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedCitiesInDialog([]);
    setSelectedPrefecturesInDialog([]);
  };

  const handleCityAdd = () => {
    selectedCitiesInDialog.forEach(city => onCitySelect(city));
    setDialogOpen(false);
    setSelectedCitiesInDialog([]);
  };

  const handlePrefectureAdd = () => {
    selectedPrefecturesInDialog.forEach(prefecture => onPrefectureSelect(prefecture));
    setDialogOpen(false);
    setSelectedPrefecturesInDialog([]);
  };

  const handleLocalSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(event.target.value);
  };

  const handleCityRemove = (city: string) => {
    onCitySelect(city);
  };

  const handlePrefectureRemove = (prefecture: string) => {
    onPrefectureSelect(prefecture);
  };

  const handleItemClick = (name: string) => {
    if (isCityDialog) {
      setSelectedCitiesInDialog(prev => 
        prev.includes(name) ? prev.filter(city => city !== name) : [...prev, name]
      );
    } else {
      setSelectedPrefecturesInDialog(prev => 
        prev.includes(name) ? prev.filter(prefecture => prefecture !== name) : [...prev, name]
      );
    }
  };

  return (
    <div className={`sidebar ${sidebarOpen ? 'open' : ''}`} ref={sidebarRef}>
      <h3>市と県の選択</h3>
      <Button variant="contained" color="primary" onClick={() => handleDialogOpen(true)}>
        市を追加
      </Button>
      <Button variant="contained" color="primary" onClick={() => handleDialogOpen(false)}>
        県を追加
      </Button>
      <FormControl variant="outlined" size="small" fullWidth className="layer-select" style={{top:'15px'}}>
        <InputLabel>レイヤー</InputLabel>
        <Select
          value={selectedLayer}
          onChange={(e) => onLayerChange(e.target.value)}
          label="レイヤー"
        >
          <MenuItem value="standard">標準地図</MenuItem>
          <MenuItem value="pale">淡色地図</MenuItem>
          <MenuItem value="photo">写真</MenuItem>
        </Select>
      </FormControl>
      <List style={{ marginTop: '16px' }}>
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
        {selectedPrefectures.map((prefecture, index) => (
          <ListItem key={`${prefecture}-${index}`}>
            <ListItemText primary={prefecture} />
            <Box sx={{ minWidth: 120 }}>
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel>色</InputLabel>
                <Select
                  value={cityColors[prefecture] || ''}
                  onChange={(e) => onColorChange(prefecture, e.target.value)}
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
            <IconButton edge="end" aria-label="delete" onClick={() => handlePrefectureRemove(prefecture)}>
              <DeleteIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>{isCityDialog ? '市を選択' : '県を選択'}</DialogTitle>
        <DialogContent>
          <TextField
            label="検索"
            variant="outlined"
            value={localSearchTerm}
            onChange={handleLocalSearchChange}
            fullWidth
            margin="normal"
            autoComplete="off"
          />
          <List>
            {(isCityDialog ? cities : prefectures).filter(name => name.toLowerCase().includes(localSearchTerm.toLowerCase())).map((name, index) => (
              <ListItemButton
                key={`${name}-${index}`}
                onClick={() => handleItemClick(name)}
                selected={isCityDialog ? selectedCitiesInDialog.includes(name) : selectedPrefecturesInDialog.includes(name)}
                sx={{
                  userSelect: 'none',
                  backgroundColor: (isCityDialog ? selectedCitiesInDialog.includes(name) : selectedPrefecturesInDialog.includes(name)) ? 'rgba(0, 0, 0, 0.08)' : 'transparent'
                }}
              >
                <ListItemText primary={name} />
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            キャンセル
          </Button>
          <Button onClick={isCityDialog ? handleCityAdd : handlePrefectureAdd} color="primary">
            追加
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Sidebar;