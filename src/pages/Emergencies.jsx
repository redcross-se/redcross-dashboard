import { useState } from "react";
import EmergencyInteraction from "../components/Emergencies/EmergencyInteraction";
import EmergenciesDisplay from "../components/Emergencies/EmergenciesDisplay";

function Emergencies() {
  const [activeEmergency, setActiveEmergency] = useState(null);
  if (!activeEmergency) {
    return <EmergenciesDisplay setActiveEmergency={setActiveEmergency} />;
  }
  return (
    <EmergencyInteraction
      activeEmergency={activeEmergency}
      onBack={() => setActiveEmergency(null)}
    />
  );
}

export default Emergencies;
