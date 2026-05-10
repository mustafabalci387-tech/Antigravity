import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import jobService from '../services/jobService';
import bidService from '../../bid/services/bidService';
import { userService } from '../../user/services/userService';
import * as SecureStore from 'expo-secure-store';
import { showToast, showErrorToast, showSuccessToast } from '../../../shared/utils/toast';

export default function useJobDetail(jobId, navigation) {
  const [user, setUser] = useState(null);
  const [job, setJob] = useState(null);
  const [jobOwner, setJobOwner] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Teklif durumu ve state'leri
  const [hasBidded, setHasBidded] = useState(false);
  const [myBidStatus, setMyBidStatus] = useState(null);
  const [amount, setAmount] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const userStr = await SecureStore.getItemAsync('user');
      const currentUser = userStr ? JSON.parse(userStr) : null;
      setUser(currentUser);

      const jobData = await jobService.getById(jobId);
      const parsedJob = jobData?.data?.job || jobData?.data || jobData;
      setJob(parsedJob);

      // İlan Sahibi Bilgisini Çek
      if (parsedJob?.is_veren_id || parsedJob?.clientId) {
        const ownerId = parsedJob.is_veren_id || parsedJob.clientId;
        try {
          const ownerRes = await userService.getUserById(ownerId);
          setJobOwner(ownerRes?.data?.user || ownerRes?.data || ownerRes);
        } catch (err) { console.warn("Owner fetch error:", err); }
      }

      const bidsData = await bidService.getBidsByJob(jobId);
      const parsedBids = Array.isArray(bidsData?.data?.bids) ? bidsData.data.bids : (Array.isArray(bidsData?.bids) ? bidsData.bids : (Array.isArray(bidsData?.data) ? bidsData.data : []));
      setBids(parsedBids);

      // Mevcut kullanıcının durumunu (freelancer ise teklif durumu) belirle
      if (currentUser) {
        const myBid = parsedBids.find(b => String(b.freelancerId || b.gonderen_id) === String(currentUser.id || currentUser._id));
        if (myBid) {
          setHasBidded(true);
          setMyBidStatus(myBid.durum || myBid.status);
        } else {
          setHasBidded(false);
          setMyBidStatus(null);
        }
      }

    } catch (error) {
      console.error('Veri çekme hatası:', error.response?.data || error);
      Alert.alert('Hata', 'Bilgiler yüklenirken bir sorun oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (jobId) {
      fetchData();
    }
  }, [fetchData, jobId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleCreateBid = async () => {
    if (!amount || !deliveryDays || !message) {
      Alert.alert('Uyarı', 'Lütfen tüm alanları doldurun.');
      return;
    }

    setSubmitting(true);
    try {
      await bidService.createBid({
        ilan_id: jobId,
        fiyat: Number(amount),
        teslim_suresi: Number(deliveryDays),
        aciklama: message
      });
      showSuccessToast('Teklifiniz başarıyla gönderildi.');
      setAmount('');
      setDeliveryDays('');
      setMessage('');
      setIsBidModalOpen(false);
      fetchData();
    } catch (error) {
      showErrorToast(error, 'Teklif gönderilemedi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = async (bidId, action) => {
    const title = action === 'accept' ? 'Teklifi Kabul Et' : 'Teklifi Reddet';
    const msg = action === 'accept'
      ? 'Bu teklifi kabul ettiğinizde diğer teklifler reddedilecektir. Emin misiniz?'
      : 'Bu teklifi reddetmek istediğinize emin misiniz?';

    Alert.alert(title, msg, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: action === 'accept' ? 'Kabul Et' : 'Reddet',
        style: action === 'reject' ? 'destructive' : 'default',
        onPress: async () => {
          try {
            if (action === 'accept') {
              await bidService.acceptBid(bidId);
              showSuccessToast('Teklif kabul edildi ve ilan güncellendi!');
            } else {
              await bidService.rejectBid(bidId);
              showSuccessToast('Teklif reddedildi.');
            }
            fetchData();
          } catch (error) {
            showErrorToast(error, 'İşlem gerçekleştirilemedi.');
          }
        }
      }
    ]);
  };

  const handleExtendJob = async () => {
    Alert.alert("Süreyi Uzat", "İlanın bitiş tarihine 7 gün eklenecektir. Onaylıyor musunuz?", [
      { text: "Vazgeç", style: "cancel" },
      { text: "Uzat", onPress: async () => {
        try {
          if(jobService.extendJob) await jobService.extendJob(jobId);
          showSuccessToast("İlan süresi 7 gün uzatıldı.");
          fetchData();
        } catch(e) {
          showErrorToast(e, "Süre uzatılamadı");
        }
      }}
    ]);
  };

  const handleDeleteJob = () => {
    Alert.alert("İlanı Sil", "Bu ilanı tamamen silmek istediğinize emin misiniz? Bu işlem geri alınamaz.", [
      { text: "Vazgeç", style: "cancel" },
      { text: "Sil", style: "destructive", onPress: async () => {
        try {
          if(jobService.deleteJob) await jobService.deleteJob(jobId);
          else if(jobService.delete) await jobService.delete(jobId);
          showSuccessToast("İlan başarıyla silindi.");
          if (navigation) navigation.goBack();
        } catch(e) {
          showErrorToast(e, "İlan silinemedi.");
        }
      }}
    ]);
  };

  return {
    user,
    job,
    jobOwner,
    bids,
    loading,
    refreshing,
    hasBidded,
    myBidStatus,
    amount, setAmount,
    deliveryDays, setDeliveryDays,
    message, setMessage,
    submitting,
    isBidModalOpen, setIsBidModalOpen,
    onRefresh,
    handleCreateBid,
    handleAction,
    handleExtendJob,
    handleDeleteJob
  };
}
