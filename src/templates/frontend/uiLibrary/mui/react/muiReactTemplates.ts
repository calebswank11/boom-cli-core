export const muiReactTemplates: Record<string, () => string> = {
  avatar: () =>
    `import { Avatar as MUIAvatar } from '@mui/material';\nexport const Avatar = (props) => <MUIAvatar {...props} />;`,

  button: () =>
    `import { Button as MUIButton } from '@mui/material';\nexport const Button = (props) => <MUIButton variant=\"contained\" {...props} />;`,

  card: () =>
    `import { Card as MUICard, CardContent, CardActions } from '@mui/material';\nexport const Card = ({ children, actions }) => (\n  <MUICard>\n    <CardContent>{children}</CardContent>\n    {actions && <CardActions>{actions}</CardActions>}\n  </MUICard>\n);`,

  dateTime: () =>
    `import { TextField } from '@mui/material';\nexport const DateTime = (props) => (\n  <TextField type=\"datetime-local\" InputLabelProps={{ shrink: true }} {...props} />\n);`,

  fab: () =>
    `import { Fab as MUIFab } from '@mui/material';\nexport const Fab = (props) => <MUIFab color=\"primary\" {...props} />;`,

  flexRow: () =>
    `import { Box } from '@mui/material';\nexport const FlexRow = ({ children, sx = {}, ...props }) => (\n  <Box display=\"flex\" flexDirection=\"row\" alignItems=\"center\" sx={sx} {...props}>\n    {children}\n  </Box>\n);`,

  icon: () =>
    `import { Icon as MUIIcon } from '@mui/material';\nexport const Icon = ({ name, ...props }) => <MUIIcon {...props}>{name}</MUIIcon>;`,

  image: () =>
    `import { Box } from '@mui/material';\nexport const Image = ({ src, alt = '', sx = {}, ...props }) => (\n  <Box component=\"img\" src={src} alt={alt} sx={{ maxWidth: '100%', ...sx }} {...props} />\n);`,

  input: () =>
    `import { TextField } from '@mui/material';\nexport const Input = (props) => <TextField variant=\"outlined\" fullWidth {...props} />;`,

  layout: () =>
    `import { Container } from '@mui/material';\nexport const Layout = ({ children, maxWidth = 'md' }) => (\n  <Container maxWidth={maxWidth}>{children}</Container>\n);`,

  loader: () =>
    `import { CircularProgress } from '@mui/material';\nexport const Loader = (props) => <CircularProgress {...props} />;`,

  modal: () =>
    `import { Modal as MUIModal, Box } from '@mui/material';\nexport const Modal = ({ open, onClose, children, sx = {} }) => (\n  <MUIModal open={open} onClose={onClose}>\n    <Box sx={{ p: 4, bgcolor: 'background.paper', borderRadius: 2, m: 'auto', mt: '10%', width: 400, ...sx }}>\n      {children}\n    </Box>\n  </MUIModal>\n);`,

  pill: () =>
    `import { Chip } from '@mui/material';\nexport const Pill = (props) => <Chip variant=\"outlined\" {...props} />;`,

  searchBar: () =>
    `import { TextField, InputAdornment } from '@mui/material';\nimport SearchIcon from '@mui/icons-material/Search';\nexport const SearchBar = (props) => (\n  <TextField\n    placeholder=\"Search...\"\n    variant=\"outlined\"\n    fullWidth\n    InputProps={{\n      startAdornment: (\n        <InputAdornment position=\"start\">\n          <SearchIcon />\n        </InputAdornment>\n      )\n    }}\n    {...props}\n  />\n);`,

  select: () =>
    `import { MenuItem, Select as MUISelect } from '@mui/material';\nexport const Select = ({ options = [], ...props }) => (\n  <MUISelect {...props}>\n    {options.map((opt) => (\n      <MenuItem key={opt.value} value={opt.value}>\n        {opt.label}\n      </MenuItem>\n    ))}\n  </MUISelect>\n);`,

  switch: () =>
    `import { Switch as MUISwitch } from '@mui/material';\nexport const Switch = (props) => <MUISwitch {...props} />;`,

  text: () =>
    `import { Typography } from '@mui/material';\nexport const Text = ({ children, variant = 'body1', ...props }) => (\n  <Typography variant={variant} {...props}>{children}</Typography>\n);`,

  themeToggle: () =>
    `import { IconButton } from '@mui/material';\nimport { Brightness4, Brightness7 } from '@mui/icons-material';\nimport { useTheme } from '@mui/material/styles';\nexport const ThemeToggle = ({ toggleTheme }) => {\n  const theme = useTheme();\n  return (\n    <IconButton onClick={toggleTheme} color=\"inherit\">\n      {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}\n    </IconButton>\n  );\n};`,

  video: () =>
    `export const Video = ({ src, ...props }) => (\n  <video controls style={{ maxWidth: '100%' }} {...props}>\n    <source src={src} type=\"video/mp4\" />\n    Your browser does not support the video tag.\n  </video>\n);`,
};
