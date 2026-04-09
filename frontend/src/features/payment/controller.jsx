"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardBody, CardFooter, Input, Button, Divider } from "@heroui/react";
import { toast } from 'react-hot-toast';
import PaymentManager from './manager';

const PaymentController = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    kart_numarasi: '',
    kart_sahibi: '',
    son_kullanma_tarihi: '',
    cvv: '',
    tutar: '100.00', // Görseldeki varsayılan tutar
    aciklama: ''
  });

  const manager = new PaymentManager();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePayment = async () => {
    // 1. Temel Kontroller
    if (formData.kart_numarasi.length !== 16) {
      toast.error("Lütfen 16 haneli kart numarasını giriniz.");
      return;
    }

    setLoading(true);
    try {
      /**
       * KRİTİK DÜZELTME: 
       * Backend (dto.py) tarafında 'freelancer_id' zorunlu ve 'tutar' float bekleniyor.
       * Burada payload oluşturarak bu eksikleri tamamlıyoruz.
       */
      const payload = {
        ...formData,
        tutar: parseFloat(formData.tutar), // Backend float beklediği için sayıya çevirdik
        freelancer_id: "65f123abc456def789", // Sunum için sabit bir mock ID ekledik
        aciklama: formData.aciklama || "Hizmet Ödemesi" // Boşsa varsayılan değer
      };

      const response = await manager.process_payment(payload);

      if (response.durum === "Başarılı") {
        toast.success(response.mesaj || "Ödeme başarıyla tamamlandı!");

        // Asenkron liste yenileme tetikleyicisi
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess();
        }

        // Formu sıfırla
        setFormData({
          kart_numarasi: '',
          cvv: '',
          kart_sahibi: '',
          son_kullanma_tarihi: '',
          aciklama: '',
          tutar: '100.00'
        });
      } else {
        toast.error(response.mesaj || "Ödeme reddedildi.");
      }
    } catch (error) {
      console.error("Ödeme Hatası:", error);
      toast.error("Bağlantı hatası: Backend sunucusuyla iletişim kurulamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center w-full py-10">
      <Card className="w-full max-w-[500px] shadow-2xl border-none bg-white rounded-[3rem] p-4 overflow-visible">
        <CardHeader className="flex flex-col items-start px-8 pt-8 pb-4">
          <h4 className="text-2xl font-black text-indigo-600 tracking-tighter uppercase italic">
            💳 GÜVENLİ ÖDEME
          </h4>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] mt-1">
            Stripe Secure Simulation
          </p>
        </CardHeader>

        <CardBody className="px-8 py-2 flex flex-col gap-6">

          {/* TUTAR PANELİ */}
          <div className="p-6 rounded-[2rem] bg-indigo-600 text-white flex justify-between items-center shadow-xl shadow-indigo-100 transition-all">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold opacity-80 uppercase italic tracking-wider">Ödenecek Toplam</span>
              <span className="text-sm font-medium italic">Hizmet Bedeli</span>
            </div>
            <span className="text-3xl font-black italic tracking-tighter">₺{formData.tutar || '0.00'}</span>
          </div>

          <Divider />

          {/* INPUT ALANLARI - Manuel Etiketli (Üst üste binme önlendi) */}
          <div className="flex flex-col gap-6 mt-2">

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-black text-gray-500 uppercase italic ml-1 text-indigo-500">Ödeme Tutarı (₺)</span>
              <Input
                type="number"
                placeholder="0.00"
                name="tutar"
                value={formData.tutar}
                onChange={handleInputChange}
                variant="bordered"
                radius="xl"
                size="lg"
                classNames={{ inputWrapper: "h-14 border-gray-200 hover:border-indigo-400 font-bold" }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-black text-gray-500 uppercase italic ml-1">Ödeme Açıklaması</span>
              <Input
                placeholder="Örn: Yazılım Geliştirme Hizmeti"
                name="aciklama"
                value={formData.aciklama}
                onChange={handleInputChange}
                variant="bordered"
                radius="xl"
                size="lg"
                classNames={{ inputWrapper: "h-14 border-gray-200" }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-black text-gray-500 uppercase italic ml-1">Kart Sahibi</span>
              <Input
                placeholder="MUSTAFA BALCI"
                name="kart_sahibi"
                value={formData.kart_sahibi}
                onChange={handleInputChange}
                variant="bordered"
                radius="xl"
                size="lg"
                classNames={{ inputWrapper: "h-14 border-gray-200" }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-black text-gray-500 uppercase italic ml-1">Kart Numarası</span>
              <Input
                placeholder="0000 0000 0000 0000"
                maxLength={16}
                name="kart_numarasi"
                value={formData.kart_numarasi}
                onChange={handleInputChange}
                variant="bordered"
                radius="xl"
                size="lg"
                classNames={{ inputWrapper: "h-14 border-gray-200" }}
              />
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col gap-1.5 flex-1">
                <span className="text-[11px] font-black text-gray-500 uppercase italic ml-1">Son Kullanma</span>
                <Input
                  placeholder="AA/YY"
                  name="son_kullanma_tarihi"
                  value={formData.son_kullanma_tarihi}
                  onChange={handleInputChange}
                  variant="bordered"
                  radius="xl"
                  size="lg"
                  classNames={{ inputWrapper: "h-14 border-gray-200" }}
                />
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <span className="text-[11px] font-black text-gray-500 uppercase italic ml-1">CVV</span>
                <Input
                  placeholder="***"
                  maxLength={3}
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleInputChange}
                  variant="bordered"
                  radius="xl"
                  size="lg"
                  classNames={{ inputWrapper: "h-14 border-gray-200" }}
                />
              </div>
            </div>
          </div>
        </CardBody>

        <CardFooter className="px-8 pb-10 pt-6">
          <Button
            className="w-full h-16 bg-gray-900 text-white font-black text-xl rounded-2xl shadow-2xl hover:bg-black transition-all active:scale-95"
            isLoading={loading}
            onPress={handlePayment}
          >
            ÖDEMEYİ TAMAMLA
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentController;