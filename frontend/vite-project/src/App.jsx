import './App.css';
import ImageUpload from './components/ImageUpload';

function App() {
  return (
    <div className="app">
      <header>
        <h1>Video Editing App</h1>
      </header>
      <main>
        <ImageUpload />
      </main>
    </div>
  );
}

export default App;
