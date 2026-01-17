"use client";

import { useState } from "react";
import { useFileStore } from "@/lib/file-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileAudio, FolderOpen, Search, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatFileSize } from "@/lib/utils";

interface FileSelectorDialogProps {
  onFilesSelected: (files: File[]) => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function FileSelectorDialog({
  onFilesSelected,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange
}: FileSelectorDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const { activeFiles, directoryHandle } = useFileStore();
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const onOpenChange = isControlled ? controlledOnOpenChange : setInternalOpen;

  const filteredFiles = activeFiles.map((file, index) => ({ file, index })).filter(({ file }) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelection = (index: number) => {
    const newCtx = new Set(selectedIndices);
    if (newCtx.has(index)) {
      newCtx.delete(index);
    } else {
      newCtx.add(index);
    }
    setSelectedIndices(newCtx);
  };

  const handleConfirm = () => {
    const selectedFiles = activeFiles.filter((_, i) => selectedIndices.has(i));
    onFilesSelected(selectedFiles);
    if (onOpenChange) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Files from Library</DialogTitle>
          <DialogDescription>
            Choose files from your uploaded collection or connected workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 py-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
        </div>

        <div className="flex-1 min-h-0 border rounded-md">
          {activeFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground p-4 text-center">
              <FolderOpen className="h-10 w-10 mb-4 opacity-50" />
              <p>No files in library</p>
              <p className="text-sm mt-1">Upload files or connect a folder on the Dashboard first.</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="p-2 space-y-1">
                {filteredFiles.map(({ file, index }) => (
                  <div
                    key={index}
                    onClick={() => toggleSelection(index)}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors
                      ${selectedIndices.has(index) ? "bg-primary/10 border-primary/20" : "hover:bg-muted"}
                    `}
                  >
                    <div className={`
                      h-5 w-5 rounded-full border flex items-center justify-center
                      ${selectedIndices.has(index) ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground"}
                    `}>
                      {selectedIndices.has(index) && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </div>
                    <FileAudio className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)} • {directoryHandle ? "Workspace" : "Uploaded"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <div className="flex items-center justify-between mt-4">
           <p className="text-sm text-muted-foreground">
             {selectedIndices.size} file(s) selected
           </p>
           <div className="flex gap-2">
             <Button variant="outline" onClick={() => onOpenChange && onOpenChange(false)}>Cancel</Button>
             <Button onClick={handleConfirm} disabled={selectedIndices.size === 0}>
               Load Selected
             </Button>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
