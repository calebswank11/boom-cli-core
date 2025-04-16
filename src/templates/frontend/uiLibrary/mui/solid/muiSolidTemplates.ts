export const muiSolidTemplates: Record<string, () => string> = {
  avatar: () => `import { Avatar as MuiAvatar } from '@mui/material';
export const Avatar = (props) => <MuiAvatar {...props} />;`,

  button: () => `import { Button as MuiButton } from '@mui/material';
export const Button = (props) => <MuiButton variant="contained" {...props} />;`,

  card: () => `import { Card as MuiCard, CardContent } from '@mui/material';
export const Card = (props) => <MuiCard {...props}><CardContent>{props.children}</CardContent></MuiCard>;`,

  dateTime: () => `import { TextField } from '@mui/material';
export const DateTime = (props) => <TextField type="datetime-local" {...props} />;`,

  fab: () => `import { Fab as MuiFab } from '@mui/material';
export const Fab = (props) => <MuiFab color="primary" {...props} />;`,

  flexRow: () => `export const FlexRow = (props) => (
  <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem', ...props.style }}>
    {props.children}
  </div>
);`,

  icon: () => `import { Icon as MuiIcon } from '@mui/material';
export const Icon = (props) => <MuiIcon {...props}>{props.children}</MuiIcon>;`,

  image: () => `export const Image = ({ src, alt = '', style = {}, ...props }) => (
  <img src={src} alt={alt} style={{ maxWidth: '100%', ...style }} {...props} />
);`,

  input: () => `import { TextField } from '@mui/material';
export const Input = (props) => <TextField variant="outlined" fullWidth {...props} />;`,

  layout: () => `export const Layout = ({ children, style = {} }) => (
  <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem', ...style }}>
    {children}
  </div>
);`,

  loader: () => `import { CircularProgress } from '@mui/material';
export const Loader = (props) => <CircularProgress {...props} />;`,

  modal: () => `import { Modal as MuiModal, Box } from '@mui/material';
export const Modal = ({ open, onClose, children, ...props }) => (
  <MuiModal open={open} onClose={onClose} {...props}>
    <Box sx={{ p: 4, backgroundColor: 'white', borderRadius: '8px', maxWidth: '90%', margin: 'auto', mt: '10%' }}>
      {children}
    </Box>
  </MuiModal>
);`,

  pill: () => `export const Pill = ({ children, style = {}, ...props }) => (
  <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '999px', backgroundColor: '#eee', fontSize: '0.875rem', ...style }} {...props}>
    {children}
  </span>
);`,

  searchBar: () => `import { TextField } from '@mui/material';
export const SearchBar = (props) => <TextField placeholder="Search..." variant="outlined" fullWidth {...props} />;`,

  select: () => `import { Select as MuiSelect, MenuItem } from '@mui/material';
export const Select = ({ options = [], ...props }) => (
  <MuiSelect {...props}>
    {options.map((opt) => (
      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
    ))}
  </MuiSelect>
);`,

  switch: () => `import { Switch as MuiSwitch } from '@mui/material';
export const Switch = (props) => <MuiSwitch {...props} />;`,

  text: () => `export const Text = ({ children, style = {}, ...props }) => (
  <p style={{ margin: 0, fontSize: '1rem', ...style }} {...props}>
    {children}
  </p>
);`,

  themeToggle: () => `import { useTheme } from '@mui/material/styles';
import { IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

export const ThemeToggle = ({ toggleTheme, isDark }) => (
  <IconButton onClick={toggleTheme} color="inherit">
    {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
  </IconButton>
);`,

  video:
    () => `export const Video = ({ src, style = {}, controls = true, ...props }) => (
  <video src={src} controls={controls} style={{ width: '100%', ...style }} {...props} />
);`,
};
