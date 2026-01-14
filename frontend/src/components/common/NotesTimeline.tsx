import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface Note {
  text: string;
  createdBy: {
    _id: string;
    name: string;
    role: string;
  };
  createdAt: string;
}

interface NotesTimelineProps {
  notes: Note[];
}

const roleColors = {
  admin: "default",
  agent: "secondary",
  employee: "default",
  end_user: "outline",
} as const;

export function NotesTimeline({ notes }: NotesTimelineProps) {
  if (!notes || notes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No notes yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notes.map((note, index) => {
        const initials =
          note.createdBy?.name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "?";


        return (
          <div key={index} className="flex gap-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {note.createdBy?.name ?? "Unknown User"}
                </span>

                <Badge
                  variant={
                    roleColors[note.createdBy?.role as keyof typeof roleColors] || "default"
                  }
                >
                  {(note.createdBy?.role ?? "unknown").replace("_", " ")}
                </Badge>

                <span className="text-xs text-muted-foreground">
                  {note.createdAt
                    ? formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })
                    : ""}
                </span>
              </div>

              <p className="text-sm bg-muted p-3 rounded-lg">
                {note.text ?? ""}
              </p>
            </div>

          </div>
        );
      })}
    </div>
  );
}
