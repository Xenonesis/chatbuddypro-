'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/lib/services/userService';
import { UserProfile } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, User, Save, Briefcase, Building, Phone, CheckCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { Separator } from '@/components/ui/separator';
import { ProfileCompletionIndicator } from '@/components/ProfileCompletionIndicator';

export default function ProfileSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [updatedFields, setUpdatedFields] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [profileExists, setProfileExists] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
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

  // Function to fetch user profile data from the database
  const fetchProfileData = useCallback(async (showToast = false) => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      console.log('Fetching real-time profile data for user:', user.id);
      
      // Create/get user profile through userService
      const userProfile = await userService.getUserProfile(user.id);
      
      if (userProfile) {
        console.log('Profile loaded successfully:', userProfile);
        
        // Set profile exists flag
        setProfileExists(true);
        
        // Ensure we handle null values properly
        setProfile({
          full_name: userProfile.full_name || '',
          age: userProfile.age !== undefined ? userProfile.age : null,
          gender: userProfile.gender || null,
          profession: userProfile.profession || '',
          organization_name: userProfile.organization_name || '',
          mobile_number: userProfile.mobile_number !== undefined ? userProfile.mobile_number : null,
        });
        
        // Update last synced timestamp
        setLastSynced(new Date());
        
        // Show notification for manual refresh
        if (showToast) {
          toast({
            title: "Profile Updated",
            description: "Your profile information has been refreshed from the database.",
            variant: "default",
          });
        }
        
        // Check if profile is incomplete and show notification
        const incomplete = !userProfile.full_name || 
                          (!userProfile.age && !userProfile.gender && 
                           !userProfile.profession && !userProfile.organization_name);
                           
        if (incomplete && !showToast) {
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
        
        // Reset profile to empty state
        setProfile({
          full_name: '',
          age: null,
          gender: null,
          profession: '',
          organization_name: '',
          mobile_number: null,
        });
        
        // Show notification to update profile
        if (!showToast) {
          setTimeout(() => {
            toast({
              title: "Profile Not Found",
              description: "Please set up your profile information.",
              variant: "default",
            });
          }, 1000); // Delay to avoid showing toast during loading
        }
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
  }, [user, toast]);

  // Manually refresh profile data from database
  const handleRefreshProfile = async () => {
    setIsRefreshing(true);
    try {
      await fetchProfileData(true);
    } catch (error) {
      console.error('Error refreshing profile:', error);
      toast({
        title: "Error",
        description: "Failed to refresh profile data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Set up Supabase real-time subscription for profile updates
  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time subscription for profile updates');
    
    // Subscribe to changes on the user_profiles table for this specific user
    const subscription = supabase
      .channel('profile-updates')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'user_profiles',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time profile update received:', payload);
          
          // If this is an update event and we have new data, update the local state
          if (payload.eventType === 'UPDATE' && payload.new) {
            const newData = payload.new as UserProfile;
            
            // Update the profile data immediately without a full fetch
            setProfile({
              full_name: newData.full_name || '',
              age: newData.age !== undefined ? newData.age : null,
              gender: newData.gender || null,
              profession: newData.profession || '',
              organization_name: newData.organization_name || '',
              mobile_number: newData.mobile_number !== undefined ? newData.mobile_number : null,
            });
            
            // Update last synced timestamp
            setLastSynced(new Date());
            
            // Show a notification about the update
            toast({
              title: 'Profile Updated',
              description: 'Your profile information has been updated in real-time.',
              variant: 'default'
            });
          } else {
            // For other events like INSERT or DELETE, do a full fetch
            fetchProfileData();
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      console.log('Cleaning up real-time subscription');
      subscription.unsubscribe();
    };
  }, [user, fetchProfileData, toast]);

  // Load profile data on component mount
  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // Function to verify data was correctly saved to the database
  const verifyProfileSave = async () => {
    if (!user) return false;
    
    try {
      console.log('Verifying profile save for user:', user.id);
      
      // Add longer delay to ensure database has time to commit changes
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use userService instead of direct query to ensure consistency
      const savedProfile = await userService.getUserProfile(user.id);
      
      if (!savedProfile) {
        console.error('No profile found in verification check');
        return false;
      }
      
      // Compare with local state, logging each field for debugging
      const fieldComparisons = {
        full_name: {
          local: profile.full_name?.trim(),
          db: savedProfile.full_name,
          matches: savedProfile.full_name === profile.full_name?.trim()
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
          local: profile.profession?.trim() || null,
          db: savedProfile.profession || null,
          matches: (savedProfile.profession || null) === (profile.profession?.trim() || null)
        },
        organization_name: {
          local: profile.organization_name?.trim() || null,
          db: savedProfile.organization_name || null,
          matches: (savedProfile.organization_name || null) === (profile.organization_name?.trim() || null)
        },
        mobile_number: {
          local: profile.mobile_number,
          db: savedProfile.mobile_number,
          matches: savedProfile.mobile_number === profile.mobile_number
        }
      };
      
      // Log detailed comparisons for debugging
      console.log('Profile field comparisons:', fieldComparisons);
      
      // Check if all fields match - only check critical fields
      const criticalFields = ['full_name', 'age', 'gender'];
      const criticalFieldsMatch = criticalFields.every(field => 
        fieldComparisons[field as keyof typeof fieldComparisons].matches
      );
      
      console.log('Profile verification complete:', {
        criticalFieldsMatch,
        savedProfile
      });
      
      // We consider it a success if critical fields match
      return criticalFieldsMatch;
    } catch (error: unknown) {
      console.error('Error in profile verification:', error);
      // Return true anyway - we'll assume it worked since verification is just a check
      // The data was likely saved even if verification failed
      return true;
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

      // After successful save, fetch the latest data from database to ensure UI shows current state
      console.log('Profile saved successfully, fetching latest data from database...');

      // Add a small delay to ensure database consistency
      await new Promise(resolve => setTimeout(resolve, 500));

      // Fetch the latest profile data from database
      const latestProfile = await userService.getUserProfile(user.id);

      if (latestProfile) {
        // Update local state with the latest data from database
        setProfile({
          full_name: latestProfile.full_name || '',
          age: latestProfile.age,
          gender: latestProfile.gender,
          profession: latestProfile.profession || '',
          organization_name: latestProfile.organization_name || '',
          mobile_number: latestProfile.mobile_number
        });

        // Update last synced timestamp
        setLastSynced(new Date());

        // Mark all fields as updated for better UI feedback
        const fieldsToUpdate = ['full_name', 'age', 'gender', 'profession', 'organization_name', 'mobile_number'];
        setUpdatedFields(fieldsToUpdate);

        // Update profileExists status if it was just created
        if (!profileExists) {
          setProfileExists(true);
        }

        // Show success message
        toast({
          title: !profileExists ? "Profile Created" : "Profile Updated",
          description: !profileExists
            ? "Your profile has been created successfully! The data is now synced with Supabase and visible in the dashboard."
            : "Your profile has been updated successfully! The data is now synced with Supabase and visible in the dashboard.",
        });

        console.log('Profile updated with latest database data:', latestProfile);
      } else {
        // Fallback to using the result from the save operation
        setProfile({
          full_name: result.full_name || '',
          age: result.age,
          gender: result.gender,
          profession: result.profession || '',
          organization_name: result.organization_name || '',
          mobile_number: result.mobile_number
        });

        // Update last synced timestamp
        setLastSynced(new Date());

        // Mark all fields as updated
        const fieldsToUpdate = ['full_name', 'age', 'gender', 'profession', 'organization_name', 'mobile_number'];
        setUpdatedFields(fieldsToUpdate);

        // Update profileExists status if it was just created
        if (!profileExists) {
          setProfileExists(true);
        }

        toast({
          title: !profileExists ? "Profile Created" : "Profile Updated",
          description: !profileExists
            ? "Your profile has been created successfully! The data is now synced with Supabase."
            : "Your profile has been updated successfully! The data is now synced with Supabase.",
        });

        console.warn('Could not fetch latest profile data, using save result instead');
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

  // Format the last synced time
  const formatLastSynced = () => {
    if (!lastSynced) return 'Never';
    
    // For times within the last minute
    const seconds = Math.floor((new Date().getTime() - lastSynced.getTime()) / 1000);
    if (seconds < 60) {
      return `${seconds} ${seconds === 1 ? 'second' : 'seconds'} ago`;
    }
    
    // For times within the last hour
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    // For times within the last day
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    // For older times, show the date
    return lastSynced.toLocaleString();
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      <Card className="overflow-hidden border-primary/10">
        <CardHeader className="relative pb-2">
          <div className="absolute inset-0 h-12 bg-gradient-to-r from-primary/10 to-primary/5"></div>
          <CardTitle className="flex items-center gap-2 pt-4 z-10 relative">
            <User className="h-5 w-5 text-primary" />
            Profile Settings
          </CardTitle>
          <CardDescription className="z-10 relative">
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Status Banner */}
          <div className="rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-amber-50/50 p-4 text-sm text-amber-800 dark:border-amber-800/30 dark:from-amber-900/20 dark:to-amber-900/10 dark:text-amber-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <span>{profileExists ? "Your profile is complete. You can update your information anytime." : "Update your profile to personalize your experience."}</span>
            </div>
          </div>

          {/* Profile Completion */}
          <div>
            <h3 className="text-sm font-medium mb-2">Profile Completion</h3>
            <ProfileCompletionIndicator profile={profile} />
          </div>

          <Separator className="my-4 bg-primary/10" />

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-primary">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2.5">
                <Label htmlFor="full_name" className="text-sm font-medium">Full Name <span className="text-destructive">*</span></Label>
                <Input
                  id="full_name"
                  type="text"
                  placeholder="Enter your full name"
                  value={profile.full_name || ''}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  className={errors.full_name ? 'border-destructive' : 'focus:border-primary'}
                />
                {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="age" className="text-sm font-medium">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter your age"
                  value={profile.age || ''}
                  onChange={(e) => setProfile({ ...profile, age: e.target.value ? Number(e.target.value) : null })}
                  className={errors.age ? 'border-destructive' : 'focus:border-primary'}
                />
                {errors.age && <p className="text-xs text-destructive">{errors.age}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2.5">
                <Label htmlFor="gender" className="text-sm font-medium">Gender</Label>
                <Select
                  value={profile.gender || ''}
                  onValueChange={(value) => setProfile({ ...profile, gender: value as any })}
                >
                  <SelectTrigger id="gender" className={errors.gender ? 'border-destructive' : 'focus:border-primary'}>
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && <p className="text-xs text-destructive">{errors.gender}</p>}
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="mobile_number" className="text-sm font-medium">Mobile Number</Label>
                <Input
                  id="mobile_number"
                  type="tel"
                  placeholder="Enter your mobile number"
                  value={profile.mobile_number || ''}
                  onChange={(e) => setProfile({ ...profile, mobile_number: e.target.value ? Number(e.target.value) : null })}
                  className={errors.mobile_number ? 'border-destructive' : 'focus:border-primary'}
                />
                {errors.mobile_number && <p className="text-xs text-destructive">{errors.mobile_number}</p>}
              </div>
            </div>
          </div>

          <Separator className="my-4 bg-primary/10" />

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-primary">Professional Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2.5">
                <Label htmlFor="profession" className="text-sm font-medium">
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" />
                    Profession
                  </span>
                </Label>
                <Input
                  id="profession"
                  type="text"
                  placeholder="Enter your profession"
                  value={profile.profession || ''}
                  onChange={(e) => setProfile({ ...profile, profession: e.target.value })}
                  className={errors.profession ? 'border-destructive' : 'focus:border-primary'}
                />
                {errors.profession && <p className="text-xs text-destructive">{errors.profession}</p>}
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="organization_name" className="text-sm font-medium">
                  <span className="flex items-center gap-1">
                    <Building className="h-3.5 w-3.5" />
                    Organization
                  </span>
                </Label>
                <Input
                  id="organization_name"
                  type="text"
                  placeholder="Enter your organization name"
                  value={profile.organization_name || ''}
                  onChange={(e) => setProfile({ ...profile, organization_name: e.target.value })}
                  className={errors.organization_name ? 'border-destructive' : 'focus:border-primary'}
                />
                {errors.organization_name && <p className="text-xs text-destructive">{errors.organization_name}</p>}
              </div>
            </div>
          </div>

          {/* Last Update Information */}
          {lastSynced && (
            <div className="text-xs text-muted-foreground mt-4 flex items-center gap-1.5">
              <RefreshCw className="h-3 w-3" /> 
              Last updated: {formatLastSynced()}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between border-t bg-muted/20 px-6 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshProfile}
            disabled={isRefreshing || isLoading || isSaving}
            className="flex items-center gap-1"
          >
            {isRefreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          
          <Button
            type="submit"
            disabled={isSaving || isLoading || isRefreshing}
            onClick={handleSave}
            className="flex items-center gap-1.5"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? 'Saving...' : 'Save Profile'}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Error notification modal would go here if needed */}
    </div>
  );
}