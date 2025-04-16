export const tailwindReactTemplates: Record<string, () => string> = {
  button: () => `import React from 'react';
  export const Button = ({ children, className = '', ...props }) => (
    <button className={\`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition \${className}\`} {...props}>
      {children}
    </button>
  );`,
  card: () => `import React from 'react';
  export const Card = ({ children, className = '' }) => (
    <div className={\`p-4 bg-white rounded shadow \${className}\`}>{children}</div>
  );`,
  input: () => `import React from 'react';
  export const Input = ({ className = '', ...props }) => (
    <input className={\`border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 \${className}\`} {...props} />
  );`,
  searchBar: () => `import React from 'react';
  export const SearchBar = ({ className = '', ...props }) => (
    <input type="search" placeholder="Search..." className={\`border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 \${className}\`} {...props} />
  );`,
  layout: () => `import React from 'react';
  export const Layout = ({ children, className = '' }) => (
    <div className={\`min-h-screen flex flex-col \${className}\`}>{children}</div>
  );`,
  themeToggle: () => `import React from 'react';
  export const ThemeToggle = ({ toggleTheme }) => (
    <button onClick={toggleTheme} className="p-2 bg-gray-200 dark:bg-gray-800 rounded">
      🌓 Toggle Theme
    </button>
  );`,
  avatar: () => `import React from 'react';
  export const Avatar = ({ src, alt = 'avatar', className = '' }) => (
    <img src={src} alt={alt} className={\`w-10 h-10 rounded-full object-cover \${className}\`} />
  );`,
  dateTime: () => `import React from 'react';
  export const DateTime = ({ date }) => (
    <span className="text-sm text-gray-500">{new Date(date).toLocaleString()}</span>
  );`,
  fab: () => `import React from 'react';
  export const Fab = ({ onClick, children }) => (
    <button onClick={onClick} className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700">
      {children}
    </button>
  );`,
  flexRow: () => `import React from 'react';
  export const FlexRow = ({ children, className = '' }) => (
    <div className={\`flex flex-row gap-4 items-center \${className}\`}>{children}</div>
  );`,
  icon: () => `import React from 'react';
  export const Icon = ({ children, className = '' }) => (
    <span className={\`inline-block \${className}\`}>{children}</span>
  );`,
  image: () => `import React from 'react';
  export const Image = ({ src, alt = '', className = '' }) => (
    <img src={src} alt={alt} className={\`w-full h-auto rounded \${className}\`} />
  );`,
  pill: () => `import React from 'react';
  export const Pill = ({ label, className = '' }) => (
    <span className={\`px-3 py-1 bg-gray-200 rounded-full text-sm \${className}\`}>{label}</span>
  );`,
  loader: () => `import React from 'react';
  export const Loader = () => (
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
  );`,
  modal: () => `import React from 'react';
  export const Modal = ({ isOpen, onClose, children }) => (
    isOpen ? (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded shadow-lg relative">
          <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-800">×</button>
          {children}
        </div>
      </div>
    ) : null
  );`,
  select: () => `import React from 'react';
  export const Select = ({ options = [], className = '', ...props }) => (
    <select className={\`border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 \${className}\`} {...props}>
      {options.map((opt, idx) => (
        <option key={idx} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );`,
  switch: () => `import React from 'react';
  export const Switch = ({ checked, onChange }) => (
    <label className="inline-flex items-center cursor-pointer">
      <span className="mr-2 text-sm">{checked ? 'On' : 'Off'}</span>
      <div className="relative">
        <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
        <div className="w-10 h-6 bg-gray-300 rounded-full shadow-inner"></div>
        <div className={\`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform transition \${checked ? 'translate-x-4' : ''}\`}></div>
      </div>
    </label>
  );`,
  text: () => `import React from 'react';
  export const Text = ({ children, className = '' }) => (
    <p className={\`text-base text-gray-800 \${className}\`}>{children}</p>
  );`,
  video: () => `import React from 'react';
  export const Video = ({ src, className = '', ...props }) => (
    <video src={src} className={\`w-full rounded \${className}\`} controls {...props} />
  );`,
};
