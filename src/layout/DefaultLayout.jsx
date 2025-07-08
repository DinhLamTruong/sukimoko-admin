import Sidebar from '../components/Sidebar';

function App({ children }) {
  return (
    <>
      <div className="flex h-full min-h-screen bg-gray-100">
        <Sidebar />

        <div className="flex flex-col flex-grow p-4 ml-64">
          {children}
        </div>
      </div>
    </>
  );
}

export default App;
