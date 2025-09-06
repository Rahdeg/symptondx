'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Stethoscope, Star, Clock, MapPin, CheckCircle } from 'lucide-react';
import { api } from '@/trpc/client';


interface DoctorSelectionProps {
    onDoctorSelect: (doctorId: string) => void;
    selectedDoctorId?: string;
    specialization?: string;
}

export function DoctorSelection({ onDoctorSelect, selectedDoctorId, specialization }: DoctorSelectionProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpecialization, setSelectedSpecialization] = useState(specialization || 'all');

    // Fetch available doctors
    const { data: doctors = [], isLoading: doctorsLoading } = api.doctors.getAvailableDoctors.useQuery({
        specialization: selectedSpecialization === 'all' ? undefined : selectedSpecialization,
        limit: 50,
    });

    // Fetch specializations
    const { data: specializations = [] } = api.doctors.getSpecializations.useQuery();

    const filteredDoctors = doctors.filter(doctor =>
        doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.hospitalAffiliations?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDoctorSelect = (doctorId: string) => {
        onDoctorSelect(doctorId);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Choose Your Preferred Doctor</h3>
                <p className="text-sm text-muted-foreground">
                    Select a doctor to review your diagnosis. You can choose based on specialization or preference.
                </p>
            </div>

            {/* Search and Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="search">Search Doctors</Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            id="search"
                            placeholder="Search by name, specialization, or hospital..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                        <SelectTrigger>
                            <SelectValue placeholder="All specializations" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All specializations</SelectItem>
                            {specializations.map((spec) => (
                                <SelectItem key={spec || 'unknown'} value={spec || 'unknown'}>
                                    {spec || 'Unknown'}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Doctors List */}
            <div className="space-y-4">
                {doctorsLoading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading doctors...</p>
                    </div>
                ) : filteredDoctors.length === 0 ? (
                    <div className="text-center py-8">
                        <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No doctors found matching your criteria</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredDoctors.map((doctor) => (
                            <Card
                                key={doctor.id}
                                className={`cursor-pointer transition-all hover:shadow-md ${selectedDoctorId === doctor.id
                                    ? 'ring-2 ring-primary bg-primary/5'
                                    : 'hover:border-primary/50'
                                    }`}
                                onClick={() => handleDoctorSelect(doctor.id)}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{doctor.name}</CardTitle>
                                            <p className="text-sm text-muted-foreground">{doctor.email}</p>
                                        </div>
                                        {selectedDoctorId === doctor.id && (
                                            <CheckCircle className="h-5 w-5 text-primary" />
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {doctor.specialization && (
                                        <Badge variant="secondary" className="text-xs">
                                            {doctor.specialization}
                                        </Badge>
                                    )}

                                    <div className="space-y-2 text-sm">
                                        {doctor.yearsOfExperience && (
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <span>{doctor.yearsOfExperience} years experience</span>
                                            </div>
                                        )}

                                        {doctor.hospitalAffiliations && (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                <span className="truncate">{doctor.hospitalAffiliations}</span>
                                            </div>
                                        )}

                                        {doctor.qualifications && (
                                            <div className="flex items-start gap-2">
                                                <Star className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                <span className="text-xs text-muted-foreground line-clamp-2">
                                                    {doctor.qualifications}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-2">
                                        <Button
                                            variant={selectedDoctorId === doctor.id ? "default" : "outline"}
                                            size="sm"
                                            className="w-full"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDoctorSelect(doctor.id);
                                            }}
                                        >
                                            {selectedDoctorId === doctor.id ? "Selected" : "Select Doctor"}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Optional: Skip Doctor Selection */}
            <div className="text-center">
                <Button
                    variant="ghost"
                    onClick={() => onDoctorSelect('')}
                    className="text-muted-foreground"
                >
                    Skip doctor selection (AI analysis only)
                </Button>
            </div>
        </div>
    );
}
