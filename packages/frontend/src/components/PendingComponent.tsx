import { Spinner } from "./Spinner";

function PendingComponent() {
  return (
    <div className="flex items-center justify-between h-auto rounded-md border p-6">
      <p className="text-lg mr-4">Loading...</p>
      <Spinner />
    </div>
  );
}

export default PendingComponent;
