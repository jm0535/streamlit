'use client';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Music2, MapPin, Calendar, Tag, Users, User } from 'lucide-react';

export interface Metadata {
  songName?: string;
  province?: string;
  decade?: string;
  genre?: string;
  cultureGroup?: string;
  researcher?: string;
  notes?: string;
}

interface MetadataFormProps {
  metadata: Metadata;
  onChange: (metadata: Metadata) => void;
  disabled?: boolean;
}

export function MetadataForm({
  metadata,
  onChange,
  disabled = false,
}: MetadataFormProps) {
  const handleChange = (field: keyof Metadata, value: string) => {
    onChange({
      ...metadata,
      [field]: value,
    });
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Music2 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Research Metadata</h3>
        </div>

        <p className="text-sm text-muted-foreground">
          Add metadata to tag your audio files for ethnomusicological research.
          This information will be included in your CSV exports.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Song Name */}
          <div className="space-y-2">
            <Label htmlFor="songName" className="flex items-center gap-2">
              <Music2 className="h-4 w-4" />
              Song Name
            </Label>
            <Input
              id="songName"
              placeholder="Enter song name"
              value={metadata.songName || ''}
              onChange={(e) => handleChange('songName', e.target.value)}
              disabled={disabled}
            />
          </div>

          {/* Province/Region */}
          <div className="space-y-2">
            <Label htmlFor="province" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Province/Region
            </Label>
            <Input
              id="province"
              placeholder="e.g., Guangdong, Yunnan"
              value={metadata.province || ''}
              onChange={(e) => handleChange('province', e.target.value)}
              disabled={disabled}
            />
          </div>

          {/* Decade */}
          <div className="space-y-2">
            <Label htmlFor="decade" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Decade
            </Label>
            <Input
              id="decade"
              placeholder="e.g., 1980s, 1990s"
              value={metadata.decade || ''}
              onChange={(e) => handleChange('decade', e.target.value)}
              disabled={disabled}
            />
          </div>

          {/* Genre/Style */}
          <div className="space-y-2">
            <Label htmlFor="genre" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Genre/Style
            </Label>
            <Input
              id="genre"
              placeholder="e.g., Folk, Traditional, Pop"
              value={metadata.genre || ''}
              onChange={(e) => handleChange('genre', e.target.value)}
              disabled={disabled}
            />
          </div>

          {/* Culture/Ethnic Group */}
          <div className="space-y-2">
            <Label htmlFor="cultureGroup" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Culture/Ethnic Group
            </Label>
            <Input
              id="cultureGroup"
              placeholder="e.g., Han, Uyghur, Tibetan"
              value={metadata.cultureGroup || ''}
              onChange={(e) => handleChange('cultureGroup', e.target.value)}
              disabled={disabled}
            />
          </div>

          {/* Researcher Name */}
          <div className="space-y-2">
            <Label htmlFor="researcher" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Researcher Name
            </Label>
            <Input
              id="researcher"
              placeholder="Your name"
              value={metadata.researcher || ''}
              onChange={(e) => handleChange('researcher', e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>

        {/* Additional Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            placeholder="Any additional context or observations about the music..."
            value={metadata.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            disabled={disabled}
            rows={3}
          />
        </div>

        {/* Info Box */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Tip:</strong> Consistent metadata across related recordings
            makes analysis and organization much easier. Consider using standardized
            terminology for genres and cultural groups.
          </p>
        </div>
      </div>
    </Card>
  );
}
