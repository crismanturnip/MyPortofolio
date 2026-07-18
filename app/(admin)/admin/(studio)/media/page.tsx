import { PageHeader } from "@/components/admin/admin-ui";
import MediaUploader from "@/components/admin/media-uploader";
export default function MediaPage() { return <div className="grid gap-6"><PageHeader title="Media" description="Unggah gambar dan salin URL-nya untuk digunakan pada konten." /><MediaUploader /></div>; }
