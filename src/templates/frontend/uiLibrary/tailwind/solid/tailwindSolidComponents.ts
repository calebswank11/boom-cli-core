export const tailwindSolidTemplates: Record<string, () => string> = {
  avatar: () => `
  export const Avatar = (props: {src: string, alt?: string}) => (
    <img class="h-10 w-10 rounded-full object-cover" src={props.src} alt={props.alt || 'Avatar'} />
  );`,
  button: () => `export const Button = (props) => (
    <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" {...props}>
      {props.children}
    </button>
  );`,
  card: () => `export const Card = (props) => (
    <div class="rounded-lg shadow p-4 bg-white dark:bg-gray-800" {...props}>
      {props.children}
    </div>
  );`,
  dateTime: () => `export const DateTime = (props) => (
    <input type="datetime-local" class="border p-2 rounded w-full" {...props} />
  );`,
  fab: () => `export const Fab = (props) => (
    <button class="fixed bottom-4 right-4 bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-blue-700" {...props}>
      {props.icon || '+'}
    </button>
  );`,
  flexRow: () => `export const FlexRow = (props) => (
    <div class="flex flex-row items-center space-x-4" {...props}>
      {props.children}
    </div>
  );`,
  icon: () => `export const Icon = (props) => (
    <i class={\`material-icons \${props.class || ''}\`}>{props.name}</i>
  );`,
  image: () => `export const Image = (props) => (
    <img class="rounded w-full object-cover" {...props} />
  );`,
  input: () => `export const Input = (props) => (
    <input class="border p-2 rounded w-full" {...props} />
  );`,
  layout: () => `export const Layout = (props) => (
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4" {...props}>
      {props.children}
    </div>
  );`,
  loader: () => `export const Loader = () => (
    <div class="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
  );`,
  modal: () => `export const Modal = (props) => (
    <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div class="bg-white dark:bg-gray-800 rounded shadow p-6 w-full max-w-md">
        {props.children}
      </div>
    </div>
  );`,
  pill: () => `export const Pill = (props) => (
    <span class="inline-block px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800" {...props}>
      {props.children}
    </span>
  );`,
  searchBar: () => `export const SearchBar = (props) => (
    <input type="search" placeholder="Search..." class="border rounded p-2 w-full" {...props} />
  );`,
  select: () => `export const Select = (props) => (
    <select class="border p-2 rounded w-full" {...props}>
      {props.children}
    </select>
  );`,
  switch: () => `export const Switch = (props) => (
    <label class="inline-flex items-center cursor-pointer">
      <input type="checkbox" class="sr-only" checked={props.checked} onChange={props.onChange} />
      <div class="w-11 h-6 bg-gray-200 rounded-full shadow-inner dark:bg-gray-700">
        <div class={\`transform transition-transform duration-200 ease-in-out w-5 h-5 bg-white rounded-full shadow \${props.checked ? 'translate-x-5' : 'translate-x-1'}\`}></div>
      </div>
    </label>
  );`,
  text: () => `export const Text = (props) => (
    <p class="text-gray-800 dark:text-gray-200" {...props}>
      {props.children}
    </p>
  );`,
  themeToggle: () => `export const ThemeToggle = (props) => (
    <button class="p-2 rounded bg-gray-200 dark:bg-gray-700" {...props}>
      {props.children || '🌓'}
    </button>
  );`,
  video: () => `export const Video = (props) => (
    <video class="w-full rounded shadow" controls {...props} />
  );`,
};
