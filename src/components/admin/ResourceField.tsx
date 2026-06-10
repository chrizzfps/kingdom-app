import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/admin/ImageUpload';

interface ResourceFieldProps {
  label: string;
  description?: string;
  value: string;
  onChange: (url: string) => void;
}

export function ResourceField({ label, description, value, onChange }: ResourceFieldProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <ImageUpload value={value} onChange={onChange} description={description} />
    </div>
  );
}
