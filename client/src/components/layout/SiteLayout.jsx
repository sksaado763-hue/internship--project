import { useCallback, useState } from 'react';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import Dialog from '../common/Dialog.jsx';

export default function SiteLayout({ children, searchTerm, onSearchTermChange, onSearchSubmit }) {
  const [dialogTitle, setDialogTitle] = useState('');
  const closeDialog = useCallback(() => setDialogTitle(''), []);

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Navbar
        searchTerm={searchTerm}
        onSearchTermChange={onSearchTermChange}
        onSearchSubmit={onSearchSubmit}
        onLogin={() => setDialogTitle('Your workspace is on the way')}
      />
      <main id="main-content">{children}</main>
      <Footer onComingSoon={(label) => setDialogTitle(`${label} is coming soon`)} />
      {dialogTitle && (
        <Dialog title={dialogTitle} onClose={closeDialog}>
          <p className="dialog-copy">Meridian is taking shape. This part of the platform will be ready in a future build.</p>
          <button className="button button--primary button--medium" type="button" onClick={closeDialog}>Sounds good</button>
        </Dialog>
      )}
    </>
  );
}
