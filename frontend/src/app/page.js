import Habits from "./habits/page";
import Analytics from "./analytics/page";
export default function Home() {
  return (
    <div className="flex">
      <div className="p-2">
        <Habits />
      </div>
      {/* <div className="p-2">
        <Analytics />
      </div> */}
    </div>
  );
}
