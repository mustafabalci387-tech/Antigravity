"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardBody,
  Avatar,
  Chip,
  Button,
  Image,
  Link as HeroLink,
  Input,
  Textarea
} from "@heroui/react";
import UserService from '@/src/features/user/services/userService';
import portfolioService from '@/src/features/portfolio/services/portfolioService';
import { useParams, useRouter } from "next/navigation";
import { showToast, showErrorToast } from '@/src/base/utils/toast';

export default function ProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  
  // MANUEL MODAL STATELERİ (SENIOR STANDART)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  
  const [user, setUser] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [profileUpdateLoading, setProfileUpdateLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [tempSkills, setTempSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  
  const [editData, setEditData] = useState({ ad: "", soyad: "", unvan: "", aciklama: "" });
  const [newProject, setNewProject] = useState({
    ad: "",
    aciklama: "",
    medya_url: "",
    etiketler: [],
    proje_linki: ""
  });
  const [token, setToken] = useState("");
  
  const fileInputRef = useRef(null);

  // PREVIEW CLEANUP (MEMORY LEAK PREVENTION)
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  useEffect(() => {
    const savedToken = sessionStorage.getItem("token");
    setToken(savedToken);
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      const [userRes, portfolioRes] = await Promise.all([
        UserService.getUserById(id),
        portfolioService.getUserPortfolio(id)
      ]);

      if (userRes) {
        setUser(userRes);
        setEditData({
          ad: userRes.ad || "",
          soyad: userRes.soyad || "",
          unvan: userRes.unvan || "",
          aciklama: userRes.aciklama || ""
        });

        const storedUser = sessionStorage.getItem("user");
        if (storedUser) {
          const currentUser = JSON.parse(storedUser);
          const currentUserId = currentUser.id || currentUser._id;
          if (String(currentUserId) === String(id)) {
            setIsOwnProfile(true);
          }
        }
      }

      const portfolioData = Array.isArray(portfolioRes) ? portfolioRes : (portfolioRes.data || []);
      setPortfolio(portfolioData);

    } catch (err) {
      console.error("Veri yükleme hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    try {
      setPortfolioLoading(true);
      const res = await portfolioService.uploadImage(file);
      setNewProject(prev => ({ ...prev, medya_url: res.medya_url || res.url }));
    } catch (err) {
      console.error("Resim yükleme hatası:", err);
    } finally {
      setPortfolioLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. GÜVENLİ ÖNİZLEME (INSTANT PREVIEW)
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
    console.log('Oluşturulan URL:', objectUrl);

    try {
      setAvatarLoading(true);
      const res = await UserService.uploadAvatar(file);
      
      if (res && res.avatar_url) {
        setUser(prev => ({ ...prev, avatar: res.avatar_url }));
        // Başarılı yüklemede önizlemeyi kaldır, asıl URL'yi kullan
        setAvatarPreview(null);
      }
    } catch (err) {
      console.error("Avatar yüklenemedi:", err);
      showErrorToast(err, "Resim yüklenirken hata oluştu.");
      // Hata durumunda önizlemeyi iptal et (fallback: eski resim görünür)
      setAvatarPreview(null);
    } finally {
      setAvatarLoading(false);
      e.target.value = "";
    }
  };

  const handleSaveSkills = async () => {
    try {
      setProfileUpdateLoading(true);
      // user.etiketler alanını güncelle (backend'de bu alan kullanılıyor)
      const res = await UserService.updateProfile({ ...editData, etiketler: tempSkills });
      setUser(prev => ({ ...prev, etiketler: res.etiketler }));
      setIsSkillsModalOpen(false);
      showToast("Yetenekleriniz başarıyla güncellendi! ✨", "success");
    } catch (err) {
      console.error("Yetenekler güncellenemedi:", err);
      showErrorToast(err, "Yetenekler kaydedilirken bir hata oluştu.");
    } finally {
      setProfileUpdateLoading(false);
    }
  };

  const addSkill = () => {
    if (!skillInput.trim()) return;
    if (tempSkills.includes(skillInput.trim())) {
      showToast("Bu yetenek zaten eklenmiş.", "error");
      return;
    }
    setTempSkills(prev => [...prev, skillInput.trim()]);
    setSkillInput("");
  };

  const removeSkill = (skillToRemove) => {
    setTempSkills(prev => prev.filter(s => s !== skillToRemove));
  };

  const handleUpdateProfile = async () => {
    try {
      setProfileUpdateLoading(true);
      const res = await UserService.updateProfile(editData);
      setUser(prev => ({ ...prev, ...res }));

      // sessionStorage'daki kullanıcı bilgisini de güncelle (Navbar vb. için)
      const storedUser = sessionStorage.getItem("user");
      if (storedUser) {
        const currentUser = JSON.parse(storedUser);
        const updatedUser = { ...currentUser, ...res };
        sessionStorage.setItem("user", JSON.stringify(updatedUser));
      }

      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Profil güncellenemedi:", err);
      showErrorToast(err, "Profil güncellenemedi.");
    } finally {
      setProfileUpdateLoading(false);
    }
  };

  const handleDeletePortfolio = async (projectId) => {
    if (!window.confirm("Bu projeyi silmek istediğinize emin misiniz?")) return;

    try {
      await portfolioService.deletePortfolioItem(projectId);
      // Anlık güncelleme: Silinen öğeyi listeden çıkar
      setPortfolio(prev => prev.filter(p => (p.id || p._id) !== projectId));
    } catch (err) {
      console.error("Portfolyo silinemedi:", err);
      showErrorToast(err, "Proje silinirken bir hata oluştu.");
    }
  };

  const handleSaveProject = async () => {
    if (!newProject.ad || !newProject.medya_url) {
      showToast("Lütfen başlık ve görsel ekleyin.", "error");
      return;
    }
    try {
      setPortfolioLoading(true);
      
      if (editingProject) {
        // GÜNCELLEME (UPDATE)
        const projectId = editingProject.id || editingProject._id;
        const res = await portfolioService.updatePortfolioItem(projectId, newProject);
        const updatedItem = res.data || res;
        
        setPortfolio(prev => prev.map(p => (p.id || p._id) === projectId ? updatedItem : p));
        showToast("Proje başarıyla güncellendi! ✨", "success");
      } else {
        // YENİ EKLEME (CREATE)
        const res = await portfolioService.createPortfolioItem(newProject, token);
        const createdItem = res.data || res;
        setPortfolio(prev => [createdItem, ...prev]);
        showToast("Yeni proje başarıyla eklendi! 🚀", "success");
      }
      
      closeProjectModal();
    } catch (err) {
      console.error("Proje kaydedilemedi:", err);
      showErrorToast(err, "Hata oluştu.");
    } finally {
      setPortfolioLoading(false);
    }
  };

  const openProjectModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setNewProject({
        ad: project.ad || "",
        aciklama: project.aciklama || "",
        medya_url: project.medya_url || "",
        etiketler: project.etiketler || [],
        proje_linki: project.proje_linki || ""
      });
    } else {
      setEditingProject(null);
      setNewProject({
        ad: "",
        aciklama: "",
        medya_url: "",
        etiketler: [],
        proje_linki: ""
      });
    }
    setIsProjectModalOpen(true);
  };

  const closeProjectModal = () => {
    setIsProjectModalOpen(false);
    setEditingProject(null);
    setNewProject({
      ad: "",
      aciklama: "",
      medya_url: "",
      etiketler: [],
      proje_linki: ""
    });
  };

  if (loading) return <div className="p-10 text-center font-bold text-primary animate-pulse">Bağlantı Kuruluyor, Bekleyiniz...</div>;
  if (!user) return <div className="p-10 text-center font-bold text-danger">Kullanıcı verisi alınamadı. (ID: {id})</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* 1. SEAMLESS BANNER */}
      <div className="h-64 sm:h-72 w-full bg-gradient-to-r from-indigo-800 to-purple-900 relative z-0">
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-12 gap-8 relative items-start">
          
          {/* LEFT COLUMN: Profile Info (4 Columns) */}
          <div className="col-span-12 lg:col-span-4 space-y-8 -mt-32 relative z-10">
            <Card className="shadow-2xl border-none rounded-2xl overflow-visible">
              <CardBody className="p-8 flex flex-col items-center text-center">
                {/* AVATAR ALANI - SENIOR LAYERED EVENT */}
                <div 
                  className="relative group cursor-pointer ring-4 ring-white rounded-full shadow-2xl relative z-[50]" 
                  onPointerDown={() => {
                    if (isOwnProfile) {
                      const input = document.getElementById('avatar-input');
                      if (input) input.click();
                    }
                  }}
                >
                  <div className="rounded-full overflow-hidden bg-white w-40 h-40 ring-4 ring-white shadow-xl flex items-center justify-center">
                    <img
                      src={avatarPreview || user.avatar || user.avatar_url || "https://i.pravatar.cc/150"}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  {isOwnProfile && (
                    <div className={`absolute inset-0 bg-black/40 rounded-full flex items-center justify-center transition-opacity ${avatarLoading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      <span className="text-white font-bold text-xs">
                        {avatarLoading ? 'Yükleniyor...' : 'Değiştir'}
                      </span>
                    </div>
                  )}
                  {/* GIZLI INPUT */}
                  <input 
                    id="avatar-input"
                    ref={fileInputRef} 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleAvatarUpload} 
                    onClick={(e) => e.stopPropagation()} 
                  />
                </div>

                <div className="mt-6 space-y-2">
                  <h1 className="text-3xl font-black text-gray-900 leading-tight">
                    {user.ad} {user.soyad}
                  </h1>
                  <p className="text-indigo-700 font-extrabold text-lg uppercase tracking-wider">
                    {user.unvan || "Full Stack Developer"}
                  </p>
                </div>

                <div className="w-full border-t border-gray-100 my-6 pt-6">
                  <p className="text-gray-500 font-medium leading-relaxed italic">
                    "{user.aciklama || "Burada kendinizden bahsedin..."}"
                  </p>
                </div>

                {isOwnProfile && (
                  <Button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="w-full h-12 font-black bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-colors relative z-50"
                  >
                    ⚙️ Profili Düzenle
                  </Button>
                )}

                <div className="flex gap-4 mt-8 flex-wrap justify-center">
                  {user.sosyal_medya?.github && (
                    <HeroLink href={user.sosyal_medya.github} isExternal className="relative z-[50]">
                      <Chip variant="flat" className="cursor-pointer hover:bg-gray-100 font-bold px-4 py-4">🐙 GitHub</Chip>
                    </HeroLink>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Yetenekler Kartı */}
            <Card className="shadow-xl border-none rounded-2xl overflow-hidden relative z-10">
              <CardBody className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <span className="p-2 bg-indigo-50 rounded-lg">🚀</span> Yetenekler
                  </h3>
                  {isOwnProfile && (
                    <button 
                      onClick={() => {
                        setTempSkills(user.etiketler || []);
                        setIsSkillsModalOpen(true);
                      }}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all font-bold shadow-sm"
                      title="Yetenekleri Düzenle"
                    >
                      ✏️
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.etiketler?.length > 0 ? (
                    user.etiketler.map(skill => (
                      <Chip key={skill} variant="flat" className="bg-slate-100 text-slate-700 font-bold px-4 py-4">
                        {skill}
                      </Chip>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 italic">Henüz eklenmemiş.</p>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* RIGHT COLUMN: Portfolio (8 Columns) */}
          <div className="col-span-12 lg:col-span-8 space-y-8 pt-8 lg:pt-0 relative z-10">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-4xl font-black text-gray-900 tracking-tight">Proje Vitrini</h2>
                <p className="text-gray-400 font-bold mt-1 uppercase text-xs tracking-widest">En yeni çalışmalarım</p>
              </div>
              {isOwnProfile && (
                <Button 
                   onClick={() => openProjectModal()}
                   className="bg-indigo-600 text-white font-black px-10 h-12 rounded-xl shadow-xl shadow-indigo-100 relative z-50 cursor-pointer"
                >
                  🚀 Yeni Proje
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {portfolio.length > 0 ? (
                portfolio.map(project => (
                  <Card key={project.id || project._id} className="group shadow-xl border-none rounded-2xl overflow-hidden hover:-translate-y-2 transition-transform duration-300 relative">
                    {/* AKSİYON BUTONLARI */}
                    {isOwnProfile && (
                      <div className="absolute top-3 right-3 z-20 flex gap-2">
                        {/* DÜZENLE BUTONU */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            openProjectModal(project);
                          }}
                          className="w-8 h-8 flex items-center justify-center bg-white/90 text-slate-600 rounded-full hover:bg-white hover:text-indigo-600 transition-all shadow-lg backdrop-blur-md border border-slate-100"
                          title="Düzenle"
                        >
                          ✏️
                        </button>
                        
                        {/* SİLME BUTONU */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePortfolio(project.id || project._id);
                          }}
                          className="w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-600 rounded-full hover:bg-red-500 hover:text-white transition-all backdrop-blur-md border border-red-500/20 shadow-lg"
                          title="Projeyi Sil"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    <CardBody className="p-0">
                      <div className="h-56 relative overflow-hidden bg-slate-100">
                        <img 
                          src={project.medya_url || project.imageUrl || '/default-placeholder.png'} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          alt={project.ad}
                        />
                      </div>
                      <div className="p-8">
                        <h4 className="font-black text-2xl text-gray-900 mb-3">{project.ad}</h4>
                        <p className="text-gray-500 font-medium text-sm line-clamp-2">{project.aciklama}</p>
                        
                        {/* TEKNOLOJİ ETİKETLERİ */}
                        {(project.technologies || project.etiketler) && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {(Array.isArray(project.technologies || project.etiketler) 
                              ? (project.technologies || project.etiketler) 
                              : (project.technologies || project.etiketler)?.split(',')
                            )?.map((tech, index) => (
                              <span key={index} className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                                {tech.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                ))
              ) : (
                <div 
                  className={`col-span-1 md:col-span-2 py-28 bg-gradient-to-b from-white to-slate-50 border-2 border-dashed border-indigo-100 rounded-[3rem] shadow-sm flex flex-col items-center justify-center text-center px-10 transition-all duration-500 relative z-[50] group ${isOwnProfile ? 'cursor-pointer hover:shadow-2xl hover:shadow-indigo-100/50 hover:border-indigo-300 hover:-translate-y-1' : ''}`}
                  onPointerDown={() => {
                    if (isOwnProfile) {
                      setIsProjectModalOpen(true);
                    }
                  }}
                >
                  <div className="relative mb-10">
                    <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
                    <div className="w-28 h-28 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-3xl rotate-12 flex items-center justify-center shadow-2xl shadow-indigo-200 relative z-10 group-hover:rotate-0 transition-transform duration-500">
                      <span className="text-6xl -rotate-12 group-hover:rotate-0 transition-transform duration-500 drop-shadow-lg">🔭</span>
                    </div>
                  </div>

                  <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
                    Portfolyon <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Henüz Boş</span>
                  </h3>
                  
                  <p className="text-slate-500 font-bold max-w-md mb-10 text-lg leading-relaxed">
                    Müşterilerin seni keşfetmesi için en iyi projelerini buraya ekleyerek <span className="text-indigo-600">profesyonel vitrinini</span> hemen oluştur.
                  </p>

                  {isOwnProfile && (
                    <Button 
                      onClick={() => openProjectModal()}
                      size="lg"
                      className="font-black px-14 h-16 text-xl rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-2xl shadow-indigo-200 hover:shadow-indigo-400/40 transition-all hover:scale-105 active:scale-95 relative z-[51] cursor-pointer"
                    >
                      İlk Projeni Yükle 🚀
                    </Button>
                  )}
                  
                  <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="text-8xl font-black select-none tracking-tighter text-indigo-900">COLLECT</span>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ─── ÖZEL MODALLAR (SAF TAILWIND - %100 GÖRÜNÜRLÜK GARANTİSİ) ─── */}

      {/* 1. YENİ PORTFOLYO MODALI */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 w-full max-w-2xl relative animate-in zoom-in duration-300 overflow-y-auto max-h-[95vh]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-indigo-950">
                {editingProject ? "✏️ Portfolyoyu Düzenle" : "✨ Yeni Portfolyo Ekle"}
              </h2>
              <button 
                onClick={closeProjectModal}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold mb-1.5 block text-slate-700 ml-1">Proje Başlığı</label>
                  <input 
                    placeholder="Projenize bir isim verin" 
                    className="w-full bg-white px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-800"
                    value={newProject.ad} 
                    onChange={(e) => setNewProject(p=>({...p, ad: e.target.value}))} 
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1.5 block text-slate-700 ml-1">Proje Linki (Opsiyonel)</label>
                  <input 
                    placeholder="https://..." 
                    className="w-full bg-white px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-800"
                    value={newProject.proje_linki} 
                    onChange={(e) => setNewProject(p=>({...p, proje_linki: e.target.value}))} 
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-semibold mb-1.5 block text-slate-700 ml-1">Kullanılan Teknolojiler (Virgülle ayırın)</label>
                <input 
                  placeholder="React, Node.js, Tailwind..." 
                  className="w-full bg-white px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-800"
                  value={newProject.etiketler.join(", ")} 
                  onChange={(e) => setNewProject(p=>({...p, etiketler: e.target.value.split(",").map(s=>s.trim())}))} 
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-1.5 block text-slate-700 ml-1">Açıklama</label>
                <textarea 
                  placeholder="Projeniz hakkında kısa bir bilgi verin..." 
                  className="w-full bg-white px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-800 min-h-[120px] resize-none"
                  value={newProject.aciklama} 
                  onChange={(e) => setNewProject(p=>({...p, aciklama: e.target.value}))} 
                />
              </div>
              
              <div>
                <label className="text-sm font-semibold mb-1.5 block text-slate-700 ml-1">Proje Görseli</label>
                <div 
                  className="h-48 border-4 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-indigo-200 transition-all overflow-hidden relative group shadow-inner"
                  onClick={() => {
                    const input = document.getElementById('portfolio-image-input');
                    if (input) input.click();
                  }}
                >
                  <div className="absolute inset-0 bg-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity z-0"></div>
                  {newProject.medya_url ? (
                    <img src={newProject.medya_url} className="w-full h-full object-cover relative z-10" alt="Project Preview" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 relative z-10">
                      <span className="text-4xl">📸</span>
                      <p className="font-black text-slate-400 text-sm italic uppercase tracking-wider text-center px-4">Görsel Yüklemek İçin Tıkla</p>
                    </div>
                  )}
                  <input 
                    id="portfolio-image-input" 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => handleFileUpload(e.target.files[0])} 
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-10">
              <Button variant="light" onClick={closeProjectModal} className="font-bold h-14 px-8">İptal</Button>
              <Button color="primary" onClick={handleSaveProject} isLoading={portfolioLoading} className="font-black px-12 h-14 rounded-2xl shadow-lg shadow-indigo-200 text-lg">
                {editingProject ? "Değişiklikleri Kaydet ✨" : "Yayınla 🚀"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 2. PROFİLİ DÜZENLE MODALI */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl p-10 w-full max-w-xl relative animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-indigo-950">⚙️ Profili Düzenle</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold mb-1.5 block text-slate-700 ml-1">Ad</label>
                  <input 
                    placeholder="Adınız" 
                    className="w-full bg-white px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-800"
                    value={editData.ad} 
                    onChange={(e) => setEditData(p=>({...p, ad:e.target.value}))} 
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1.5 block text-slate-700 ml-1">Soyad</label>
                  <input 
                    placeholder="Soyadınız" 
                    className="w-full bg-white px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-800"
                    value={editData.soyad} 
                    onChange={(e) => setEditData(p=>({...p, soyad:e.target.value}))} 
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-semibold mb-1.5 block text-slate-700 ml-1">Unvan (Örn: UI Designer)</label>
                <input 
                  placeholder="Profesyonel unvanınız" 
                  className="w-full bg-white px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-800"
                  value={editData.unvan} 
                  onChange={(e) => setEditData(p=>({...p, unvan:e.target.value}))} 
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-1.5 block text-slate-700 ml-1">Hakkımda</label>
                <textarea 
                  placeholder="Kısa bir özgeçmiş yazın..." 
                  className="w-full bg-white px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-800 min-h-[120px] resize-none"
                  value={editData.aciklama} 
                  onChange={(e) => setEditData(p=>({...p, aciklama:e.target.value}))} 
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-10">
              <Button variant="light" onClick={() => setIsEditModalOpen(false)} className="font-bold h-12">Kapat</Button>
              <Button color="primary" onClick={handleUpdateProfile} isLoading={profileUpdateLoading} className="font-black px-10 h-12 rounded-xl shadow-lg shadow-indigo-100">Güncelle ✨</Button>
            </div>
          </div>
        </div>
      )}

      {/* 3. YETENEKLERİ DÜZENLE MODALI */}
      {isSkillsModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 w-full max-w-xl relative animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-indigo-950">🚀 Yetenekleri Yönet</h2>
              <button 
                onClick={() => setIsSkillsModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold mb-2 block text-slate-700 ml-1">Yeni Yetenek Ekle</label>
                <div className="flex gap-2">
                  <input 
                    placeholder="Örn: React, UI Design..." 
                    className="flex-1 bg-white px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-800"
                    value={skillInput} 
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <Button 
                    onClick={addSkill}
                    className="bg-indigo-600 text-white font-black px-6 rounded-xl hover:bg-indigo-700 h-12"
                  >
                    Ekle
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold mb-3 block text-slate-700 ml-1">Eklenen Yetenekler</label>
                <div className="flex flex-wrap gap-2 min-h-[100px] p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  {tempSkills.length > 0 ? (
                    tempSkills.map((skill, idx) => (
                      <span 
                        key={idx} 
                        className="bg-white border border-slate-200 text-slate-700 text-sm font-bold px-4 py-2 rounded-full flex items-center gap-2 group hover:border-red-200 hover:text-red-600 transition-all cursor-default shadow-sm"
                      >
                        {skill}
                        <button 
                          onClick={() => removeSkill(skill)}
                          className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-50 text-slate-300 group-hover:text-red-500 transition-colors"
                        >
                          ✕
                        </button>
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400 italic m-auto">Henüz yetenek eklemediniz.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-10">
              <Button variant="light" onClick={() => setIsSkillsModalOpen(false)} className="font-bold h-14 px-8 text-slate-500">İptal</Button>
              <Button 
                color="primary" 
                onClick={handleSaveSkills} 
                isLoading={profileUpdateLoading}
                className="font-black px-12 h-14 rounded-2xl shadow-lg shadow-indigo-200 text-lg bg-indigo-600 hover:bg-indigo-700"
              >
                Değişiklikleri Kaydet ✨
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}