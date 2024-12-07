import React, { useEffect, useRef, useState } from "react";
import {
  FaArrowLeft,
  FaMicrophoneSlash,
  FaPhoneSlash,
  FaClock,
} from "react-icons/fa";
import {
  StreamVideo,
  StreamCall,
  StreamVideoClient,
  useStreamVideoClient,
} from "@stream-io/video-react-sdk";
import { useAuth } from "../../context/authContext";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import {
  CallControls,
  StreamTheme,
  SpeakerLayout,
  SpeakingWhileMutedNotification,
  ToggleAudioPublishingButton,
  RecordCallButton,
  CancelCallButton,
} from "@stream-io/video-react-sdk";
import {
  Channel,
  Chat,
  MessageInput,
  MessageList,
  Window,
  useCreateChatClient,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";

import "stream-chat-react/dist/css/v2/index.css";
function CustomCallControls() {
  return (
    <div className="str-video__call-controls">
      <SpeakingWhileMutedNotification>
        <ToggleAudioPublishingButton />
      </SpeakingWhileMutedNotification>

      <RecordCallButton />
      <CancelCallButton />
    </div>
  );
}

function EmergencyInteraction({ activeEmergency, onBack }) {
  const [client, setClient] = useState(null);
  const { user: authUser, streamToken } = useAuth();
  const [userCall, setUserCall] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);

  useEffect(() => {
    console.log(streamToken);
    console.log("USER", authUser);
    const client = StreamVideoClient.getOrCreateInstance({
      apiKey: "3pkfpxv4cver",
      user: {
        id: authUser.id.toString(),
      },
      token: streamToken,
    });
    const initCall = async () => {
      try {
        if (userCall) return;
        const call = client.call("default", activeEmergency.roomId);
        await call.join();
        await call.camera.disable();
        setClient(client);
        setUserCall(call);
      } catch (error) {
        console.error("Error joining call:", error);
        setTimeout(() => {
          initCall();
        }, 1000);
      }
    };
    initCall();
  }, [streamToken, authUser, userCall]);

  useEffect(() => {
    if (!client || !userCall) return;

    const initChat = async () => {
      try {
        const chatClient = StreamChat.getInstance("3pkfpxv4cver");
        setChatClient(chatClient);
        await chatClient.connectUser(
          {
            id: authUser.id.toString(),
          },
          streamToken
        );
        const channel = chatClient.channel("messaging", activeEmergency.roomId);
        setChannel(channel);
        await channel.create();
      } catch (error) {
        console.error("Error initializing chat:", error);
      }
    };

    initChat();
  }, [client, authUser, streamToken, activeEmergency.roomId]);

  console.log("CHAT CLIENT", chatClient);
  console.log("CHANNEL", channel);

  return (
<div className="flex h-[100vh] overflow-hidden">
  {/* Accident Area */}
  <div className="w-[600px] border-r p-4">
    <button
      className="flex items-center mb-4 text-blue-500"
      onClick={onBack}
    >
      <FaArrowLeft className="mr-2" /> Back to emergencies
    </button>
    <h2 className="text-xl font-bold mb-4">
      Accident #{activeEmergency.id}
    </h2>

    {/* Video Call */}
    <div className="h-[390px]">
      {client && userCall && (
        <StreamVideo client={client}>
          <StreamTheme>
            <StreamCall call={userCall}>
              <SpeakerLayout excludeLocalParticipant={true} />
              <CustomCallControls />
            </StreamCall>
          </StreamTheme>
        </StreamVideo>
      )}
    </div>

    {/* Chat Section */}
    <div className="w-full h-[400px] flex flex-col">
  {chatClient && channel && (
    <Chat client={chatClient}>
      <Channel channel={channel}>
        <Window>
          {/* Message List - Single Scrollable Instance */}

            <MessageList />


          {/* Message Input - Fixed at Bottom */}
          <div
            className="sticky bottom-0 bg-white"
            style={{
              boxShadow: "0 -2px 5px rgba(0, 0, 0, 0.1)",
              zIndex: 10,
              padding: "10px",
            }}
          >
            <MessageInput />
          </div>
        </Window>
      </Channel>
    </Chat>
  )}
</div>
  </div>

  {/* Report Area */}
  <div className="w-[500px] border-r p-4">
    <div className="mb-4">
      <p className="font-bold">Time of occurrence:</p>
      <p>{new Date(activeEmergency.createdAt).toLocaleString()}</p>
    </div>
    <div className="flex justify-between mb-4">
      {["Location", "Information", "Medical History"].map((tab) => (
        <button key={tab} className="px-4 py-2 bg-gray-200 rounded">
          {tab}
        </button>
      ))}
    </div>
  </div>

  {/* Map Area */}
  <div className="w-[500px] p-4">
    <div className="h-[500px] bg-gray-200 mb-4"></div>
    <p className="font-bold mb-2">Select a rescue team</p>
    <div className="mb-4">
      <p className="flex items-center text-green-500">
        <FaClock className="mr-2" /> On site in less than 10 minutes
      </p>
    </div>
    <div className="mb-4">
      <p className="flex items-center text-red-500">
        <FaClock className="mr-2" /> On site in more than 10 minutes
      </p>
    </div>
    <button className="w-full bg-red-500 text-white py-2 rounded">
      Send report and dispatch a team
    </button>
  </div>
</div>

  );
}

export default EmergencyInteraction;
