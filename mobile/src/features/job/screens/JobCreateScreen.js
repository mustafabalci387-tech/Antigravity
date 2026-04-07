// JobCreateScreen.js — Yeni İş İlanı Oluşturma
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import jobService from '../services/jobService';

export default function JobCreateScreen({ navigation }) {
  const [form, setForm] = useState({ title: '', description: '', budget: '', category: '' });

  const handleChange = (name, value) => setForm({ ...form, [name]: value });

  const handleSubmit = async () => {
    try {
      await jobService.create(form);
      Alert.alert('Başarılı', 'İş ilanı oluşturuldu!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Hata', err.response?.data?.message || err.message);
    }
  };

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
      <Button title="Oluştur" onPress={handleSubmit} />
    </View>
  );
}
