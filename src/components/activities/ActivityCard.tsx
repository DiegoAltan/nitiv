import { motion } from "framer-motion";
import { Calendar, Clock, Users, Star, Edit, Trash2, Image } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity } from "@/hooks/useActivities";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

interface ActivityCardProps {
  activity: Activity;
  canEdit: boolean;
  canRate: boolean;
  onEdit?: (activity: Activity) => void;
  onDelete?: (id: string) => void;
  onRate?: (activityId: string, rating: number) => void;
}

const activityTypeLabels = {
  interna: { label: "Interna", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  externa: { label: "Externa", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
  conjunta: { label: "Conjunta", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
};

export function ActivityCard({
  activity,
  canEdit,
  canRate,
  onEdit,
  onDelete,
  onRate,
}: ActivityCardProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const typeInfo = activityTypeLabels[activity.activity_type];
  const formattedDate = format(new Date(activity.activity_date), "d 'de' MMMM, yyyy", { locale: es });

  const renderStars = (rating: number, interactive = false, userRating?: number | null) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            disabled={!interactive}
            onClick={() => interactive && onRate?.(activity.id, star)}
            className={`transition-colors ${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"}`}
          >
            <Star
              className={`w-4 h-4 ${
                star <= (userRating ?? rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-muted text-muted-foreground/30"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const hasPhotos = activity.photo_urls && activity.photo_urls.length > 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="card-elevated hover:shadow-lg transition-all duration-300 overflow-hidden group">
          {/* Photo Gallery Preview */}
          {hasPhotos && (
            <div className="relative h-32 bg-muted overflow-hidden">
              <img
                src={activity.photo_urls![0]}
                alt={activity.title}
                className="w-full h-full object-cover"
              />
              {activity.photo_urls!.length > 1 && (
                <Badge 
                  variant="secondary" 
                  className="absolute bottom-2 right-2 bg-black/60 text-white border-0"
                >
                  <Image className="w-3 h-3 mr-1" />
                  +{activity.photo_urls!.length - 1}
                </Badge>
              )}
            </div>
          )}

          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                  {activity.is_upcoming && (
                    <Badge variant="outline" className="border-primary/50 text-primary text-xs">
                      Próximamente
                    </Badge>
                  )}
                  {activity.course && (
                    <Badge variant="secondary" className="text-xs">
                      {activity.course.name} - {activity.course.level}
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-foreground line-clamp-2">{activity.title}</h3>
              </div>
              {canEdit && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEdit?.(activity)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onDelete?.(activity.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {activity.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {activity.description}
              </p>
            )}

            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formattedDate}</span>
              </div>
              {activity.activity_time && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{activity.activity_time.slice(0, 5)}</span>
                </div>
              )}
            </div>

            {activity.organizers.length > 0 && (
              <div className="flex items-start gap-1.5">
                <Users className="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
                <div className="flex flex-wrap gap-1">
                  {activity.organizers.map((org, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-muted px-1.5 py-0.5 rounded"
                    >
                      {org}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Photo thumbnails */}
            {hasPhotos && (
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {activity.photo_urls!.slice(0, 4).map((url, idx) => (
                  <Dialog key={idx}>
                    <DialogTrigger asChild>
                      <button
                        className="w-12 h-12 rounded-md overflow-hidden shrink-0 border border-border hover:ring-2 ring-primary transition-all"
                        onClick={() => setSelectedPhoto(url)}
                      >
                        <img
                          src={url}
                          alt={`Foto ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl p-0">
                      <img
                        src={url}
                        alt={activity.title}
                        className="w-full h-auto rounded-lg"
                      />
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            )}

            {/* Rating Section */}
            <div className="pt-2 border-t border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Valoración:</span>
                  {renderStars(activity.average_rating || 0)}
                  {activity.total_ratings! > 0 && (
                    <span className="text-xs text-muted-foreground">
                      ({activity.average_rating?.toFixed(1)} · {activity.total_ratings} votos)
                    </span>
                  )}
                </div>
              </div>
              
              {canRate && !activity.is_upcoming && (
                <div className="mt-2 pt-2 border-t border-border/30">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Tu valoración:</span>
                    {renderStars(0, true, activity.user_rating)}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}
