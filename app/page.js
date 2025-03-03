import UploadCSV from "../components/UploadCSV";
import SEOAgentUI from "../components/seo-agent-ui";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <h1 className="text-2xl font-bold mb-4 text-black">Upload Your CSV</h1>
      {/* <UploadCSV /> */}
      <SEOAgentUI />
    </div>
  );
}
