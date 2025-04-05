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
import { ProfileCompletionIndicator } from '@/components/ProfileCompletionIndicator';

export default function ProfileSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [updatedFields, setUpdatedFields] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [profileExists, setProfileExists] = useState(false);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    full_name: '',
    age: null,
    gender: null,
    profession: '',
    organization_name: '',
    mobile_number: null,
  });

  // Check if profile is empty or incomplete
  const isProfileIncomplete = () => {
    return !profile.full_name || 
           (!profile.age && !profile.gender && !profile.profession && 
            !profile.organization_name && !profile.mobile_number);
  };

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
          
          // Set profile exists flag
          setProfileExists(true);
          
          setProfile({
            full_name: userProfile.full_name,
            age: userProfile.age,
            gender: userProfile.gender,
            profession: userProfile.profession || '',
            organization_name: userProfile.organization_name || '',
            mobile_number: userProfile.mobile_number || null,
          });
          
          // Check if profile is incomplete and show notification
          const incomplete = !userProfile.full_name || 
                            (!userProfile.age && !userProfile.gender && 
                             !userProfile.profession && !userProfile.organization_name);
                             
          if (incomplete) {
            setTimeout(() => {
              toast({
                title: "Complete Your Profile",
                description: "Please take a moment to update your profile information.",
                variant: "default",
              });
            }, 1000); // Delay to avoid showing toast during loading
          }
        } else {
          console.log('No profile found, using default empty profile');
          // If no profile exists yet, we'll use the default empty profile
          setProfileExists(false);
          
          // Show notification to update profile
          setTimeout(() => {
            toast({
              title: "Profile Not Found",
              description: "Please set up your profile information.",
              variant: "default",
            });
          }, 1000); // Delay to avoid showing toast during loading
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
      
      // Add delay to ensure database has time to commit changes
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use direct database query to ensure we're getting fresh data
      const { data: savedProfile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error || !savedProfile) {
        console.error('Error or no profile found in verification check:', error);
        return false;
      }
      
      // Compare with local state, logging each field for debugging
      const fieldComparisons = {
        full_name: {
          local: profile.full_name,
          db: savedProfile.full_name,
          matches: savedProfile.full_name === profile.full_name
        },
        age: {
          local: profile.age,
          db: savedProfile.age,
          matches: savedProfile.age === profile.age
        },
        gender: {
          local: profile.gender,
          db: savedProfile.gender,
          matches: savedProfile.gender === profile.gender
        },
        profession: {
          local: profile.profession,
          db: savedProfile.profession,
          matches: savedProfile.profession === profile.profession
        },
        organization_name: {
          local: profile.organization_name,
          db: savedProfile.organization_name,
          matches: savedProfile.organization_name === profile.organization_name
        },
        mobile_number: {
          local: profile.mobile_number,
          db: savedProfile.mobile_number,
          matches: savedProfile.mobile_number === profile.mobile_number
        }
      };
      
      // Log detailed comparisons for debugging
      console.log('Profile field comparisons:', fieldComparisons);
      
      // Check if all fields match
      const allFieldsMatch = Object.values(fieldComparisons).every(f => f.matches);
      
      console.log('Profile verification complete:', {
        allFieldsMatch,
        savedProfile,
        localProfile: profile
      });
      
      return allFieldsMatch;
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

    // Create a new profile object to send to the API
    const profileToSave = {
      full_name: profile.full_name?.trim(),
      age: profile.age === '' ? null : profile.age,
      gender: profile.gender === '' ? null : profile.gender,
      profession: profile.profession?.trim() || null,
      organization_name: profile.organization_name?.trim() || null,
      mobile_number: profile.mobile_number === '' ? null : profile.mobile_number,
    };

    // Validate the data
    const errors: Record<string, string> = {};
    
    // Basic validation
    if (!profileToSave.full_name) {
      errors.full_name = "Full name is required";
    }
    
    if (profileToSave.age !== null) {
      if (isNaN(Number(profileToSave.age))) {
        errors.age = "Age must be a number";
      } else if (Number(profileToSave.age) < 13) {
        errors.age = "Age must be at least 13";
      } else if (Number(profileToSave.age) > 120) {
        errors.age = "Age must be less than 120";
      }
    }
    
    // Update errors state
    setErrors(errors);
    
    // Don't proceed if there are validation errors
    if (Object.keys(errors).length > 0) {
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
      console.log('Profile data to save:', profileToSave);
      
      // Use userService to save the profile
      const result = await userService.upsertUserProfile(user.id, profileToSave);
      
      if (!result) {
        console.error('Profile save operation returned null result');
        toast({
          title: "Error",
          description: "Failed to save profile changes. Please try again.",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }
      
      // Verify the save operation with a delay to ensure DB consistency
      const verified = await verifyProfileSave();
      
      // Mark all fields as updated for better UI feedback
      const fieldsToUpdate = ['full_name', 'age', 'gender', 'profession', 'organization_name', 'mobile_number'];
      setUpdatedFields(fieldsToUpdate);
      
      // Update local state with the saved data
      setProfile({
        ...profile,
        full_name: result.full_name,
        age: result.age,
        gender: result.gender,
        profession: result.profession || '',
        organization_name: result.organization_name || '',
        mobile_number: result.mobile_number
      });
      
      if (verified) {
        toast({
          title: !profileExists ? "Profile Created" : "Profile Updated",
          description: !profileExists 
            ? "Your profile has been created successfully! Thank you for providing your information." 
            : "Your profile has been updated successfully",
        });
        
        // Update profileExists status if it was just created
        if (!profileExists) {
          setProfileExists(true);
        }
      } else {
        console.warn('Profile verification failed - data may not have saved correctly');
        toast({
          title: "Warning",
          description: !profileExists
            ? "Your profile was created but verification failed. Please check your information."
            : "Your profile was updated but verification failed. Please check your information.",
          variant: "warning",
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
      
      {!isLoading && (
        <div className="bg-amber-50 dark:bg-amber-900/20 px-6 py-3 border-b border-amber-100 dark:border-amber-800">
          {isProfileIncomplete() ? (
            <div className="space-y-2">
              <p className="text-sm text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-circle">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Your profile is incomplete. Please provide the required information.
              </p>
              <ProfileCompletionIndicator profile={profile} />
            </div>
          ) : (
            <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Your profile is complete! You can still update your information if needed.
            </p>
          )}
        </div>
      )}
      
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
                <Label htmlFor="full_name" className="flex items-center">
                  Full Name
                  <span className="text-red-500 ml-1">*</span>
                  <span className="text-xs text-slate-400 ml-1">(required)</span>
                </Label>
                <Input
                  id="full_name"
                  value={profile.full_name || ''}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="Enter your full name"
                  className={`${updatedFields.includes('full_name') ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}
                    ${errors.full_name ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}
                    ${!profile.full_name ? 'border-amber-300' : ''}`}
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
          className={`w-full sm:w-auto ml-auto ${!profileExists ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
          disabled={isLoading || isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : !profileExists ? (
            <>
              <User className="mr-2 h-4 w-4" />
              Create Profile
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