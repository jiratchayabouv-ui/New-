import './globals.css';

export const metadata = {
  title: 'DNA AI Dashboard V3',
  description: 'DNA Dashboard'
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
