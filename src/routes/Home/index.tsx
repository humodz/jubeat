import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div>
      <p>Home Screen</p>
      <p>
        <Link to="/play">Go to Play</Link>
      </p>
    </div>
  );
}
