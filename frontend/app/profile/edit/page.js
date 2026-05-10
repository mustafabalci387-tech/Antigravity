"use client";

import { useState, useEffect } from "react";
import { 
  Input, 
  Button, 
  Textarea, 
  Card, 
  CardBody, 
  CardHeader, 
  Avatar, 
  Divider,
  Chip
} from "@heroui/react";
import UserService from '@/src/features/user/services/userService';
import { useRouter } from "next/navigation";
import { showToast, showErrorToast } from '@/src/shared/utils/toast';

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    ad: "",
    soyad: "",
    unvan: "",
    aciklama: "",
    deneyim: "",
    etiketler: [],
    sosyal_medya: {
      github: "",
      linkedin: "",
      website: ""
    }
  });
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    // Burada normalde auth context'ten kullanıcı çekilmeli. 
    // Şimdilik test amaçlı bir ID ile çekiyoruz veya mock yapıyoruz.
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (currentUser) {
      loadUserData(currentUser.id || currentUser._id);
    }
  }, []);

  const loadUserData = async (userId) => {
    try {
      const res = await UserService.getUserById(userId);
      if (res.success || res.ad) {
        const u = res.data?.user || res;
        setUser(u);
        setFormData({
          ad: u.ad || "",
          soyad: u.soyad || "",
          unvan: u.unvan || "",
          aciklama: u.aciklama || "",
          deneyim: u.deneyim || "",
          etiketler: u.etiketler || [],
          sosyal_medya: u.sosyal_medya || { github: "", linkedin: "", website: "" }
        });
      }
    } catch (err) {
      console.error("Yükleme hatası:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const res = await UserService.uploadAvatar(file);
      if (res.success || res.avatar_url) {
        setUser(prev => ({ ...prev, avatar: res.data?.avatarUrl || res.avatar_url }));
        showToast("Avatar güncellendi!", "success");
      }
    } catch (err) {
      showErrorToast(err, "Yükleme başarısız.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (skillInput && !formData.etiketler.includes(skillInput)) {
      setFormData(prev => ({
        ...prev,
        etiketler: [...prev.etiketler, skillInput]
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      etiketler: prev.etiketler.filter(s => s !== skillToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await UserService.updateProfile(formData);
      if (res.success) {
        showToast("Profil başarıyla güncellendi!", "success");
        router.refresh();
      }
    } catch (err) {
      showErrorToast(err, "Güncelleme hatası.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-10 text-center">Yükleniyor...</div>;

  return (
    <div className="container mx-auto max-w-4xl py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Profili Düzenle</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sol Kolon: Avatar */}
        <Card className="p-4">
          <CardBody className="flex flex-col items-center gap-4">
            <Avatar 
              src={user.avatar} 
              className="w-32 h-32 text-large" 
              isBordered 
              color="primary"
            />
            <div className="flex flex-col items-center gap-2">
              <label className="cursor-pointer">
                <Button color="primary" variant="flat" as="span" isLoading={loading}>
                  Avatar Değiştir
                </Button>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleAvatarChange}
                />
              </label>
              <p className="text-xs text-gray-500 text-center">
                JPG veya PNG. Max 2MB.
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Sağ Kolon: Form */}
        <Card className="md:col-span-2">
          <CardHeader>
            <h2 className="text-xl font-semibold">Kişisel Bilgiler</h2>
          </CardHeader>
          <Divider />
          <CardBody>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Ad" 
                  name="ad"
                  value={formData.ad}
                  onChange={handleChange}
                  isRequired
                />
                <Input 
                  label="Soyad" 
                  name="soyad"
                  value={formData.soyad}
                  onChange={handleChange}
                  isRequired
                />
              </div>

               <Input 
                label="Profesyonel Başlık" 
                placeholder="Örn: Kıdemli React Geliştirici" 
                name="unvan"
                value={formData.unvan}
                onChange={handleChange}
              />

               <Input 
                label="Deneyim" 
                placeholder="Örn: 5+ Yıl" 
                name="deneyim"
                value={formData.deneyim}
                onChange={handleChange}
              />

               <Textarea 
                label="Hakkımda" 
                placeholder="Kendinizden bahsedin..." 
                name="aciklama"
                value={formData.aciklama}
                onChange={handleChange}
              />

              <div>
                <p className="text-sm mb-2">Yetenekler</p>
                 <div className="flex gap-2 mb-2 flex-wrap">
                  {formData.etiketler.map(s => (
                    <Chip key={s} onClose={() => removeSkill(s)} variant="flat" color="secondary">
                      {s}
                    </Chip>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Yetenek ekle..." 
                    size="sm"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                  />
                  <Button size="sm" color="secondary" onClick={handleAddSkill}>Ekle</Button>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="font-medium">Sosyal Linkler</h3>
                 <Input 
                  label="GitHub" 
                  placeholder="https://github.com/..." 
                  name="sosyal_medya.github"
                  value={formData.sosyal_medya.github}
                  onChange={handleChange}
                />
                 <Input 
                  label="LinkedIn" 
                  placeholder="https://linkedin.com/in/..." 
                  name="sosyal_medya.linkedin"
                  value={formData.sosyal_medya.linkedin}
                  onChange={handleChange}
                />
                 <Input 
                  label="Kişisel Web Sitesi" 
                  placeholder="https://..." 
                  name="sosyal_medya.website"
                  value={formData.sosyal_medya.website}
                  onChange={handleChange}
                />
              </div>

              <Button 
                color="primary" 
                type="submit" 
                size="lg" 
                isLoading={loading}
              >
                Değişiklikleri Kaydet
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
