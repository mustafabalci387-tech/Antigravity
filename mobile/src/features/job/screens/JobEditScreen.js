// JobEditScreen.js — İş İlanı Güncelleme
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, Alert } from 'react-native';
import jobService from '../services/jobService';

export default function JobEditScreen({ route, navigation }) {
  const { id } = route.params;
  const [form, setForm] = useState({ title: '', description: '', budget: '', category: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobService.getById(id)
      .then(job => setForm({
        title: job.title,
        description: job.description,
        budget: String(job.budget),
        category: job.category
      }))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (name, value) => setForm({ ...form, [name]: value });

  const handleSubmit = async () => {
    try {
      await jobService.update(id, form);
      Alert.alert('Başarılı', 'İş ilanı güncellendi!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Hata', err.response?.data?.message || err.message);
    }
  };

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text>Başlık</Text>
      <TextInput value={form.title} onChangeText={v => handleChange('title', v)} style={{ borderWidth: 1, marginBottom: 8 }} />
      <Text>Kategori</Text>
      <TextInput value={form.category} onChangeText={v => handleChange('category', v)} style={{ borderWidth: 1, marginBottom: 8 }} />
      <Text>Bütçe</Text>
      <TextInput value={form.budget} onChangeText={v => handleChange('budget', v)} keyboardType="numeric" style={{ borderWidth: 1, marginBottom: 8 }} />
      <Text>Açıklama</Text>
      <TextInput value={form.description} onChangeText={v => handleChange('description', v)} style={{ borderWidth: 1, marginBottom: 8 }} multiline />
      <Button title="Güncelle" onPress={handleSubmit} />
    </View>
  );
}
