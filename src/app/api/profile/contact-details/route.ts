import { NextResponse } from 'next/server';
import { authLib } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const user = await authLib.getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 });
    }

    const { profileId } = await req.json();
    if (!profileId) {
      return NextResponse.json({ error: 'Missing profileId' }, { status: 400 });
    }

    // 2. Resolve current user DB row
    const { data: currentUserRow } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    if (!currentUserRow) {
      return NextResponse.json({ error: 'User record not found' }, { status: 404 });
    }
    const currentUserId = currentUserRow.id;

    // 3. Check if current user is premium
    const { data: profileRow } = await supabaseAdmin
      .from('profiles')
      .select('is_premium')
      .eq('user_id', currentUserId)
      .maybeSingle();

    const isPremiumProfile = profileRow?.is_premium || false;
    const isPremiumRole = currentUserRow.role !== 'user' && currentUserRow.role !== 'free';
    const isPremium = isPremiumProfile || isPremiumRole;

    if (!isPremium) {
      return NextResponse.json(
        { error: 'Premium subscription required to view contact details' },
        { status: 403 }
      );
    }

    // 4. Resolve target profile details
    const { data: targetProfile } = await supabaseAdmin
      .from('profiles')
      .select('user_id, first_name')
      .eq('profile_id', profileId)
      .maybeSingle();

    if (!targetProfile) {
      return NextResponse.json({ error: 'Target profile not found' }, { status: 404 });
    }
    const targetUserId = targetProfile.user_id;

    // 5. Check if connection interest is accepted
    const { data: request } = await supabaseAdmin
      .from('match_requests')
      .select('status')
      .or(`and(sender_user_id.eq.${currentUserId},receiver_user_id.eq.${targetUserId}),and(sender_user_id.eq.${targetUserId},receiver_user_id.eq.${currentUserId})`)
      .eq('status', 'accepted')
      .maybeSingle();

    if (!request) {
      return NextResponse.json(
        { error: 'You must connect and receive their acceptance before viewing contact details' },
        { status: 403 }
      );
    }

    // 6. Fetch target candidate contact details using admin connection
    const { data: targetUser } = await supabaseAdmin
      .from('users')
      .select('email, mobile_number')
      .eq('id', targetUserId)
      .maybeSingle();

    if (!targetUser) {
      return NextResponse.json({ error: 'Contact user details not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      email: targetUser.email || 'N/A',
      phone: targetUser.mobile_number || 'N/A'
    });

  } catch (err: any) {
    console.error('Contact details API error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
