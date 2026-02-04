import React, { useState } from 'react';
import InputField from '../common/InputField';
import Button from '../common/Button';
import { Upload } from 'lucide-react';

/**
 * Report Form Component - Multi-step form untuk laporan pengaduan
 * Step 1: Identity
 * Step 2: Incident Details
 * Step 3: Evidence & Witness
 */
export default function ReportForm({ onSubmit, isLoading = false }) {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    // Step 1: Identity
    nama_pelapor: '',
    nomor_kontak: '',
    email: '',
    hubungan_dengan_korban: '', // Orangtua, Guru, Tetangga, Diri Sendiri, Lainnya
    
    // Step 2: Incident
    nama_korban: '',
    usia_korban: '',
    jenis_kelamin: '', // Perempuan, Laki-laki
    desa: '',
    lokasi_kejadian: '',
    waktu_kejadian: '',
    deskripsi_kejadian: '',
    kategori_kasus: '', // Kekerasan Fisik, Kekerasan Seksual, Penelantaran, etc
    
    // Step 3: Evidence
    bukti_foto: null,
    nama_saksi: '',
    kontak_saksi: '',
  });

  const validateStep = (currentStep) => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.nama_pelapor.trim()) newErrors.nama_pelapor = 'Nama pelapor wajib diisi';
      if (!formData.nomor_kontak.trim()) newErrors.nomor_kontak = 'Nomor kontak wajib diisi';
      if (!formData.email.trim()) newErrors.email = 'Email wajib diisi';
      if (!formData.hubungan_dengan_korban) newErrors.hubungan_dengan_korban = 'Hubungan dengan korban wajib dipilih';
    }

    if (currentStep === 2) {
      if (!formData.nama_korban.trim()) newErrors.nama_korban = 'Nama korban wajib diisi';
      if (!formData.usia_korban) newErrors.usia_korban = 'Usia korban wajib diisi';
      if (!formData.jenis_kelamin) newErrors.jenis_kelamin = 'Jenis kelamin wajib dipilih';
      if (!formData.desa) newErrors.desa = 'Desa wajib dipilih';
      if (!formData.lokasi_kejadian.trim()) newErrors.lokasi_kejadian = 'Lokasi kejadian wajib diisi';
      if (!formData.waktu_kejadian) newErrors.waktu_kejadian = 'Waktu kejadian wajib diisi';
      if (!formData.deskripsi_kejadian.trim()) newErrors.deskripsi_kejadian = 'Deskripsi kejadian wajib diisi';
      if (!formData.kategori_kasus) newErrors.kategori_kasus = 'Kategori kasus wajib dipilih';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    setStep(step - 1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      bukti_foto: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateStep(3)) {
      await onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress Bar */}
      <div className="flex gap-2">
        {[1, 2, 3].map(s => (
          <div
            key={s}
            className={`h-2 flex-1 rounded-full transition-all ${
              s <= step ? 'bg-purple-600' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Step 1: Identity */}
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Identitas Pelapor</h3>
          <InputField
            label="Nama Lengkap"
            name="nama_pelapor"
            value={formData.nama_pelapor}
            onChange={handleChange}
            error={errors.nama_pelapor}
            required
          />
          <InputField
            label="Nomor Kontak"
            name="nomor_kontak"
            type="tel"
            value={formData.nomor_kontak}
            onChange={handleChange}
            error={errors.nomor_kontak}
            required
          />
          <InputField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />
          <InputField
            label="Hubungan dengan Korban"
            name="hubungan_dengan_korban"
            type="select"
            value={formData.hubungan_dengan_korban}
            onChange={handleChange}
            error={errors.hubungan_dengan_korban}
            required
          >
            <option value="">-- Pilih --</option>
            <option value="Orangtua">Orangtua</option>
            <option value="Guru">Guru</option>
            <option value="Tetangga">Tetangga</option>
            <option value="Diri Sendiri">Diri Sendiri</option>
            <option value="Lainnya">Lainnya</option>
          </InputField>
        </div>
      )}

      {/* Step 2: Incident Details */}
      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Detail Kejadian</h3>
          <InputField
            label="Nama Korban"
            name="nama_korban"
            value={formData.nama_korban}
            onChange={handleChange}
            error={errors.nama_korban}
            required
          />
          <InputField
            label="Usia Korban"
            name="usia_korban"
            type="number"
            value={formData.usia_korban}
            onChange={handleChange}
            error={errors.usia_korban}
            required
          />
          <InputField
            label="Jenis Kelamin"
            name="jenis_kelamin"
            type="select"
            value={formData.jenis_kelamin}
            onChange={handleChange}
            error={errors.jenis_kelamin}
            required
          >
            <option value="">-- Pilih --</option>
            <option value="Perempuan">Perempuan</option>
            <option value="Laki-laki">Laki-laki</option>
          </InputField>
          <InputField
            label="Desa"
            name="desa"
            type="select"
            value={formData.desa}
            onChange={handleChange}
            error={errors.desa}
            required
          >
            <option value="">-- Pilih Desa --</option>
            <option value="Desa A">Desa A</option>
            <option value="Desa B">Desa B</option>
          </InputField>
          <InputField
            label="Lokasi Kejadian"
            name="lokasi_kejadian"
            value={formData.lokasi_kejadian}
            onChange={handleChange}
            error={errors.lokasi_kejadian}
            required
          />
          <InputField
            label="Waktu Kejadian"
            name="waktu_kejadian"
            type="datetime-local"
            value={formData.waktu_kejadian}
            onChange={handleChange}
            error={errors.waktu_kejadian}
            required
          />
          <InputField
            label="Deskripsi Kejadian"
            name="deskripsi_kejadian"
            type="textarea"
            value={formData.deskripsi_kejadian}
            onChange={handleChange}
            error={errors.deskripsi_kejadian}
            required
          />
          <InputField
            label="Kategori Kasus"
            name="kategori_kasus"
            type="select"
            value={formData.kategori_kasus}
            onChange={handleChange}
            error={errors.kategori_kasus}
            required
          >
            <option value="">-- Pilih Kategori --</option>
            <option value="Kekerasan Fisik">Kekerasan Fisik</option>
            <option value="Kekerasan Seksual">Kekerasan Seksual</option>
            <option value="Penelantaran">Penelantaran</option>
          </InputField>
        </div>
      )}

      {/* Step 3: Evidence & Witness */}
      {step === 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Bukti & Saksi</h3>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition">
            <Upload size={32} className="mx-auto mb-2 text-gray-400" />
            <label className="block">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <span className="text-blue-600 cursor-pointer hover:underline">
                Klik untuk upload
              </span>
              <p className="text-sm text-gray-500">atau drag and drop gambar bukti</p>
            </label>
            {formData.bukti_foto && (
              <p className="text-sm text-green-600 mt-2">✓ {formData.bukti_foto.name}</p>
            )}
          </div>

          <InputField
            label="Nama Saksi"
            name="nama_saksi"
            value={formData.nama_saksi}
            onChange={handleChange}
          />
          <InputField
            label="Kontak Saksi"
            name="kontak_saksi"
            type="tel"
            value={formData.kontak_saksi}
            onChange={handleChange}
          />
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrev}
          disabled={step === 1}
          className="flex-1"
        >
          Sebelumnya
        </Button>
        
        {step < 3 ? (
          <Button
            type="button"
            variant="primary"
            onClick={handleNext}
            className="flex-1"
          >
            Lanjutkan
          </Button>
        ) : (
          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            className="flex-1"
          >
            Kirim Laporan
          </Button>
        )}
      </div>
    </form>
  );
}
