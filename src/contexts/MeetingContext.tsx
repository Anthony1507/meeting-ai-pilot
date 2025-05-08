
import React, { createContext, useContext } from "react";
import { useMeetingData } from "@/hooks/useMeetingData";
import { useMeetingOperations } from "@/hooks/useMeetingOperations";
import { MeetingContextType } from "@/types/meeting.types";

// Create the context with undefined as initial value
const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

export const MeetingProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  // Get data and state management from our hooks
  const {
    activeMeeting,
    setActiveMeeting,
    messages,
    setMessages,
    tasks,
    setTasks,
    isLoading,
    setIsLoading,
    loadMessages,
    loadTasks
  } = useMeetingData();

  // Get operations from our hook
  const {
    activeFilter,
    setActiveFilter,
    addMessage,
    addTask,
    updateTaskStatus,
    startMeeting,
    endMeeting,
    filteredMessages
  } = useMeetingOperations({
    activeMeeting,
    setActiveMeeting,
    messages,
    setMessages,
    tasks,
    setTasks,
    setIsLoading,
    loadMessages,
    loadTasks
  });

  // Combine everything into our context value
  const contextValue: MeetingContextType = {
    activeMeeting,
    messages,
    tasks,
    isLoading,
    addMessage,
    addTask,
    updateTaskStatus,
    filteredMessages,
    activeFilter,
    setActiveFilter,
    startMeeting,
    endMeeting
  };

  return (
    <MeetingContext.Provider value={contextValue}>
      {children}
    </MeetingContext.Provider>
  );
};

export const useMeeting = () => {
  const context = useContext(MeetingContext);
  if (context === undefined) {
    throw new Error("useMeeting must be used within a MeetingProvider");
  }
  return context;
};

// Re-export types from the types file for backwards compatibility
export type { Message, Task, MessageType, MessageCategory } from "@/types/meeting.types";
