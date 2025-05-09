
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Paperclip } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface FileAttachmentProps {
  onAttach: (fileName: string) => void;
  disabled: boolean;
}

export const FileAttachment: React.FC<FileAttachmentProps> = ({ onAttach, disabled }) => {
  const [showDialog, setShowDialog] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleClick = () => {
    if (!disabled) {
      setShowDialog(true);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      toast({
        title: "Subiendo archivo",
        description: `Subiendo ${file.name}...`,
      });
      
      // Here you would implement the actual file upload logic
      // For now we're just passing the file name
      onAttach(file.name);
      
      setShowDialog(false);
      toast({
        title: "Archivo subido",
        description: `${file.name} ha sido adjuntado.`,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "No se pudo adjuntar el archivo.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Button 
        type="button" 
        size="icon" 
        variant="ghost"
        onClick={handleClick}
        className="text-muted-foreground"
        disabled={disabled}
      >
        <Paperclip className="h-4 w-4" />
      </Button>
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjuntar archivo</DialogTitle>
            <DialogDescription>
              Selecciona un archivo para adjuntar a la conversación
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <input
              ref={fileInputRef}
              type="file"
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-white
                hover:file:bg-primary/80"
              onChange={handleFileChange}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
