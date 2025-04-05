'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/lib/services/userService';
import { UserProfile } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, User, Save, Briefcase, Building, Phone, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { Separator } from '@/components/ui/separator';

export default function ProfileSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [updatedFields, setUpdatedFields] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    full_name: '',
    age: null,
    gender: null,
    profession: '',
    organization_name: '',
    mobile_number: null,
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('Loading profile for user:', user.id);
        setIsLoading(true);
        
        // Create/get user profile
        const userProfile = await userService.getUserProfile(user.id);
        
        if (userProfile) {
          console.log('Profile loaded successfully:', userProfile);
          setProfile({
            full_name: userProfile.full_name,
            age: userProfile.age,
            gender: userProfile.gender,
            profession: userProfile.profession || '',
            organization_name: userProfile.organization_name || '',
            mobile_number: userProfile.mobile_number || null,
          });
        } else {
          console.log('No profile found, using default empty profile');
          // If no profile exists yet, we'll use the default empty profile
          // The save operation will create a new profile when needed
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile information. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadProfile();
    } else {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Function to verify data was correctly saved to the database
  const verifyProfileSave = async () => {
    if (!user) return false;
    
    try {
      console.log('Verifying profile save for user:', user.id);
      
      // Use the userService instead of direct Supabase calls
      const savedProfile = await userService.getUserProfile(user.id);
      
      if (!savedProfile) {
        console.error('No profile found in verification check');
        return false;
      }
      
      // Compare with local state
      const fieldsMatch = 
        savedProfile.full_name === profile.full_name &&
        savedProfile.age === profile.age &&
        savedProfile.gender === profile.gender &&
        savedProfile.profession === profile.profession &&
        savedProfile.organization_name === profile.organization_name &&
        savedProfile.mobile_number === profile.mobile_number;
        
      console.log('Profile verification:', {
        databaseData: savedProfile,
        localData: profile,
        fieldsMatch
      });
      
      return fieldsMatch;
    } catch (error: unknown) {
      console.error('Error in profile verification:', error);
      return false;
    }
  };

  const validateProfile = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate required fields
    if (!profile.full_name?.trim()) {
      newErrors.full_name = "Full name is required";
    }
    
    // Validate age range
    if (profile.age !== null && profile.age !== undefined) {
      if (profile.age < 13) {
        newErrors.age = "You must be at least 13 years old";
      } else if (profile.age > 120) {
        newErrors.age = "Please enter a valid age";
      }
    }
    
    // Validate mobile number format (if provided)
    if (profile.mobile_number && profile.mobile_number.toString().length < 10) {
      newErrors.mobile_number = "Please enter a valid mobile number (at least 10 digits)";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!user) return;

    // Validate profile data before saving
    if (!validateProfile()) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    setUpdatedFields([]);

    try {
      console.log('Saving profile for user:', user.id);
      
      // Get current profile to check what's changing
      const existingProfile = await userService.getUserProfile(user.id);
      
      // Track which fields we're changing for UI updates
      const changedFields: string[] = [];
      
      if (existingProfile) {
        // Check which fields are actually changing
        if (existingProfile.full_name !== profile.full_name) changedFields.push('full_name');
        if (existingProfile.age !== profile.age) changedFields.push('age');
        if (existingProfile.gender !== profile.gender) changedFields.push('gender');
        if (existingProfile.profession !== profile.profession) changedFields.push('profession');
        if (existingProfile.organization_name !== profile.organization_name) changedFields.push('organization_name');
        if (existingProfile.mobile_number !== profile.mobile_number) changedFields.push('mobile_number');
        
        // If nothing is changing, skip the update
        if (changedFields.length === 0) {
          toast({
            title: "No Changes",
            description: "Your profile is already up to date.",
          });
          setIsSaving(false);
          return;
        }
      } else {
        // All fields are considered "changed" when creating a new profile
        changedFields.push('full_name', 'age', 'gender', 'profession', 'organization_name', 'mobile_number');
      }
      
      // Use userService to save the profile
      const success = await userService.upsertUserProfile(user.id, {
        full_name: profile.full_name,
        age: profile.age,
        gender: profile.gender,
        profession: profile.profession,
        organization_name: profile.organization_name,
        mobile_number: profile.mobile_number,
      });
      
      if (!success) {
        toast({
          title: "Error",
          description: "Failed to save profile changes. Please try again.",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }
      
      // Verify the save operation
      const verified = await verifyProfileSave();
      
      // Set which fields were updated for UI feedback
      setUpdatedFields(changedFields);
      
      if (verified) {
        toast({
          title: "Success",
          description: "Your profile has been updated successfully",
        });
      } else {
        console.warn('Profile verification failed - data may not have saved correctly');
        toast({
          title: "Warning",
          description: "Your profile may not have saved correctly. Please check your information.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "There was a problem saving your profile. Please try again.",
        variant: "destructive",
      });
      setUpdatedFields([]);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full shadow-md border-slate-200 dark:border-slate-800">
      <CardHeader className="bg-slate-50 dark:bg-slate-900 rounded-t-lg border-b border-slate-100 dark:border-slate-800">
        <CardTitle className="text-xl flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Settings
        </CardTitle>
        <CardDescription>
          Update your personal information
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Personal Information</h3>
              
              <div className="space-y-1.5">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profile.full_name || ''}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="Enter your full name"
                  className={`${updatedFields.includes('full_name') ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}
                    ${errors.full_name ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}`}
                />
                {errors.full_name && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.full_name}</p>
                )}
                {updatedFields.includes('full_name') && (
                  <p className="text-xs flex items-center gap-1 text-green-600 dark:text-green-400 mt-1">
                    <CheckCircle className="h-3 w-3" /> Updated
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={profile.age || ''}
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      setProfile({ 
                        ...profile, 
                        age: value ? Number(value) : null 
                      });
                    }}
                    placeholder="Enter your age"
                    min="13"
                    max="120"
                    className={`${updatedFields.includes('age') ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}
                      ${errors.age ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}`}
                  />
                  {errors.age && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.age}</p>
                  )}
                  {updatedFields.includes('age') && (
                    <p className="text-xs flex items-center gap-1 text-green-600 dark:text-green-400 mt-1">
                      <CheckCircle className="h-3 w-3" /> Updated
                    </p>
                  )}
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={profile.gender || ''}
                    onValueChange={(value) => setProfile({ ...profile, gender: value as any })}
                  >
                    <SelectTrigger 
                      id="gender"
                      className={updatedFields.includes('gender') ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}
                    >
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                  {updatedFields.includes('gender') && (
                    <p className="text-xs flex items-center gap-1 text-green-600 dark:text-green-400 mt-1">
                      <CheckCircle className="h-3 w-3" /> Updated
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Professional Information</h3>
              
              <div className="space-y-1.5">
                <Label htmlFor="profession">
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4" />
                    <span>Profession</span>
                  </div>
                </Label>
                <Input
                  id="profession"
                  value={profile.profession || ''}
                  onChange={(e) => setProfile({ ...profile, profession: e.target.value })}
                  placeholder="Enter your profession"
                  className={updatedFields.includes('profession') ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}
                />
                {updatedFields.includes('profession') && (
                  <p className="text-xs flex items-center gap-1 text-green-600 dark:text-green-400 mt-1">
                    <CheckCircle className="h-3 w-3" /> Updated
                  </p>
                )}
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="organization_name">
                  <div className="flex items-center gap-1.5">
                    <Building className="h-4 w-4" />
                    <span>Organization</span>
                  </div>
                </Label>
                <Input
                  id="organization_name"
                  value={profile.organization_name || ''}
                  onChange={(e) => setProfile({ ...profile, organization_name: e.target.value })}
                  placeholder="Enter your organization name"
                  className={updatedFields.includes('organization_name') ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}
                />
                {updatedFields.includes('organization_name') && (
                  <p className="text-xs flex items-center gap-1 text-green-600 dark:text-green-400 mt-1">
                    <CheckCircle className="h-3 w-3" /> Updated
                  </p>
                )}
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="mobile_number">
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4" />
                    <span>Mobile Number</span>
                  </div>
                </Label>
                <Input
                  id="mobile_number"
                  type="tel"
                  inputMode="numeric"
                  value={profile.mobile_number?.toString() || ''}
                  onChange={(e) => {
                    // Only allow numeric values
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setProfile({ 
                      ...profile, 
                      mobile_number: value ? Number(value) : null 
                    });
                  }}
                  placeholder="Enter your mobile number"
                  className={`${updatedFields.includes('mobile_number') ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}
                    ${errors.mobile_number ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}`}
                />
                {errors.mobile_number && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.mobile_number}</p>
                )}
                {updatedFields.includes('mobile_number') && (
                  <p className="text-xs flex items-center gap-1 text-green-600 dark:text-green-400 mt-1">
                    <CheckCircle className="h-3 w-3" /> Updated
                  </p>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Enter numbers only, no spaces or special characters
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-slate-50 dark:bg-slate-900 rounded-b-lg border-t border-slate-100 dark:border-slate-800 py-4">
        <Button
          onClick={handleSave}
          className="w-full sm:w-auto ml-auto"
          disabled={isLoading || isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Profile
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}