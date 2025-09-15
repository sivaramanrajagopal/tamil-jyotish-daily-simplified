import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabaseClient';

// ICS Calendar Generator for Tamil Panchangam
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      start_date = new Date().toISOString().split('T')[0],
      end_date,
      include_auspicious = 'true',
      include_inauspicious = 'true',
      include_special_days = 'true',
      include_rs_warnings = 'true',
      include_chandrashtama = 'true',
      calendar_name = 'Tamil Panchangam'
    } = req.query;

    // Calculate end date (default to 1 year from start)
    const endDate = end_date || new Date(new Date(start_date as string).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Fetch panchangam data
    const { data: panchangamData, error } = await supabase
      .from('daily_panchangam')
      .select('*')
      .gte('date', start_date)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching panchangam data:', error);
      return res.status(500).json({ error: 'Failed to fetch panchangam data' });
    }

    if (!panchangamData || panchangamData.length === 0) {
      return res.status(404).json({ error: 'No panchangam data found for the specified date range' });
    }

    // Generate ICS content
    const icsContent = generateICSContent(panchangamData, {
      include_auspicious: include_auspicious === 'true',
      include_inauspicious: include_inauspicious === 'true',
      include_special_days: include_special_days === 'true',
      include_rs_warnings: include_rs_warnings === 'true',
      include_chandrashtama: include_chandrashtama === 'true',
      calendar_name: calendar_name as string
    });

    // Set appropriate headers for ICS file
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${calendar_name}.ics"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    return res.status(200).send(icsContent);

  } catch (error) {
    console.error('Error generating ICS calendar:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function generateICSContent(panchangamData: any[], options: {
  include_auspicious: boolean;
  include_inauspicious: boolean;
  include_special_days: boolean;
  include_rs_warnings: boolean;
  include_chandrashtama: boolean;
  calendar_name: string;
}): string {
  const { calendar_name } = options;
  const now = new Date();
  const timestamp = formatICSDate(now);

  let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Tamil Jyotish//Panchangam Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:${calendar_name}
X-WR-CALDESC:Tamil Panchangam Calendar with auspicious and inauspicious times
X-WR-TIMEZONE:Asia/Kolkata
`;

  // Generate events for each day
  panchangamData.forEach(day => {
    const events = generateDayEvents(day, options);
    events.forEach(event => {
      icsContent += event;
    });
  });

  icsContent += 'END:VCALENDAR';

  return icsContent;
}

function generateDayEvents(day: any, options: {
  include_auspicious: boolean;
  include_inauspicious: boolean;
  include_special_days: boolean;
  include_rs_warnings: boolean;
  include_chandrashtama: boolean;
}): string[] {
  const events: string[] = [];
  const date = new Date(day.date);
  const dateStr = formatICSDate(date);

  // Special Days
  if (options.include_special_days) {
    if (day.is_amavasai) {
      events.push(generateEvent(
        '🌑 அமாவாசை (New Moon)',
        'New Moon Day - Considered auspicious for certain activities',
        dateStr,
        dateStr,
        true,
        'SPECIAL_DAY'
      ));
    }
    if (day.is_pournami) {
      events.push(generateEvent(
        '🌕 பௌர்ணமி (Full Moon)',
        'Full Moon Day - Considered auspicious for certain activities',
        dateStr,
        dateStr,
        true,
        'SPECIAL_DAY'
      ));
    }
    if (day.is_ekadashi) {
      events.push(generateEvent(
        '🕉️ ஏகாதசி (Ekadashi)',
        'Ekadashi - Fasting day for spiritual purification',
        dateStr,
        dateStr,
        true,
        'SPECIAL_DAY'
      ));
    }
    if (day.is_dwadashi) {
      events.push(generateEvent(
        '🕉️ துவாதசி (Dwadashi)',
        'Dwadashi - Day after Ekadashi',
        dateStr,
        dateStr,
        true,
        'SPECIAL_DAY'
      ));
    }
    if (day.is_ashtami) {
      events.push(generateEvent(
        '🕉️ அஷ்டமி (Ashtami)',
        'Ashtami - Eighth day of lunar cycle',
        dateStr,
        dateStr,
        true,
        'SPECIAL_DAY'
      ));
    }
    if (day.is_navami) {
      events.push(generateEvent(
        '🕉️ நவமி (Navami)',
        'Navami - Ninth day of lunar cycle',
        dateStr,
        dateStr,
        true,
        'SPECIAL_DAY'
      ));
    }
    if (day.is_trayodashi) {
      events.push(generateEvent(
        '🕉️ திரயோதசி (Trayodashi)',
        'Trayodashi - Thirteenth day of lunar cycle',
        dateStr,
        dateStr,
        true,
        'SPECIAL_DAY'
      ));
    }
    if (day.is_sashti) {
      events.push(generateEvent(
        '🕉️ சஷ்டி (Sashti)',
        'Sashti - Sixth day of lunar cycle',
        dateStr,
        dateStr,
        true,
        'SPECIAL_DAY'
      ));
    }
  }

  // Nakshatra Information
  if (day.main_nakshatra) {
    let nakshatraDescription = `Today's Nakshatra: ${day.main_nakshatra}`;
    if (day.nakshatra_yogam) {
      nakshatraDescription += `\\nYogam: ${day.nakshatra_yogam}`;
    }
    
    // Add moon phase information if available
    if (day.is_valar_pirai) {
      nakshatraDescription += `\\nMoon Phase: வளர்பிறை (Waxing Moon)`;
    } else if (day.is_thei_pirai) {
      nakshatraDescription += `\\nMoon Phase: தேய்பிறை (Waning Moon)`;
    }

    events.push(generateEvent(
      `🌟 ${day.main_nakshatra} நட்சத்திரம்`,
      nakshatraDescription,
      dateStr,
      dateStr,
      true,
      'NAKSHATRA'
    ));
  }

  // RS Nakshatra Warnings
  if (options.include_rs_warnings && isRSNakshatra(day.main_nakshatra)) {
    events.push(generateEvent(
      '⚠️ தீதுரு நட்சத்திரம் - RS Warning',
      `Avoid: Medical treatments, Travel, Financial transactions\\nNakshatra: ${day.main_nakshatra}`,
      dateStr,
      dateStr,
      true,
      'WARNING'
    ));
  }

  // Chandrashtama Warnings
  if (options.include_chandrashtama && day.chandrashtama_for) {
    const chandrashtamaNakshatras = Array.isArray(day.chandrashtama_for) 
      ? day.chandrashtama_for.join(', ')
      : day.chandrashtama_for;
    
    events.push(generateEvent(
      '🔄 சந்திராஷ்டமம் (Chandrashtama)',
      `Inauspicious for: ${chandrashtamaNakshatras}\\nAvoid important activities`,
      dateStr,
      dateStr,
      true,
      'WARNING'
    ));
  }

  // Auspicious Times
  if (options.include_auspicious && day.abhijit_muhurta) {
    const abhijitTimes = parseTimeRange(day.abhijit_muhurta, date);
    if (abhijitTimes) {
      events.push(generateEvent(
        '✅ அபிஜித் முகூர்த்தம் (Abhijit Muhurta)',
        'Most auspicious time of the day - Best for starting new ventures',
        formatICSDate(abhijitTimes.start),
        formatICSDate(abhijitTimes.end),
        false,
        'AUSPICIOUS'
      ));
    }
  }

  // Inauspicious Times
  if (options.include_inauspicious) {
    // Rahu Kalam
    if (day.rahu_kalam) {
      const rahuTimes = parseTimeRange(day.rahu_kalam, date);
      if (rahuTimes) {
        events.push(generateEvent(
          '⚠️ ராகு காலம் (Rahu Kalam)',
          'Inauspicious time - Avoid starting new activities',
          formatICSDate(rahuTimes.start),
          formatICSDate(rahuTimes.end),
          false,
          'INAUSPICIOUS'
        ));
      }
    }

    // Yamagandam
    if (day.yamagandam) {
      const yamaTimes = parseTimeRange(day.yamagandam, date);
      if (yamaTimes) {
        events.push(generateEvent(
          '⏱️ எமகண்டம் (Yamagandam)',
          'Inauspicious time - Avoid important activities',
          formatICSDate(yamaTimes.start),
          formatICSDate(yamaTimes.end),
          false,
          'INAUSPICIOUS'
        ));
      }
    }

    // Kuligai
    if (day.kuligai) {
      const kuligaiTimes = parseTimeRange(day.kuligai, date);
      if (kuligaiTimes) {
        events.push(generateEvent(
          '⏳ குளிகை (Kuligai)',
          'Inauspicious time - Avoid starting new activities',
          formatICSDate(kuligaiTimes.start),
          formatICSDate(kuligaiTimes.end),
          false,
          'INAUSPICIOUS'
        ));
      }
    }
  }

  return events;
}

function generateEvent(
  summary: string,
  description: string,
  startDate: string,
  endDate: string,
  isAllDay: boolean,
  category: string
): string {
  const now = new Date();
  const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@tamilpanchangam.com`;
  
  let event = `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatICSDate(now)}
SUMMARY:${summary}
DESCRIPTION:${description.replace(/\n/g, '\\n')}
CATEGORIES:${category}
`;

  if (isAllDay) {
    event += `DTSTART;VALUE=DATE:${startDate.split('T')[0].replace(/-/g, '')}
DTEND;VALUE=DATE:${endDate.split('T')[0].replace(/-/g, '')}
`;
  } else {
    event += `DTSTART:${startDate}
DTEND:${endDate}
`;
  }

  // Add color coding based on category
  switch (category) {
    case 'AUSPICIOUS':
      event += 'COLOR:green\n';
      break;
    case 'INAUSPICIOUS':
    case 'WARNING':
      event += 'COLOR:red\n';
      break;
    case 'SPECIAL_DAY':
      event += 'COLOR:blue\n';
      break;
    case 'NAKSHATRA':
      event += 'COLOR:purple\n';
      break;
  }

  event += 'END:VEVENT\n';
  return event;
}

function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function parseTimeRange(timeStr: string, date: Date): { start: Date; end: Date } | null {
  if (!timeStr) return null;

  // Parse time range like "7:30 AM - 9:00 AM" or "7:30-9:00"
  const timeMatch = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?\s*-\s*(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
  
  if (!timeMatch) return null;

  const [, startHour, startMin = '00', startPeriod, endHour, endMin = '00', endPeriod] = timeMatch;

  const startTime = parseTime(startHour, startMin, startPeriod);
  const endTime = parseTime(endHour, endMin, endPeriod);

  if (!startTime || !endTime) return null;

  const startDate = new Date(date);
  startDate.setHours(startTime.hours, startTime.minutes, 0, 0);

  const endDate = new Date(date);
  endDate.setHours(endTime.hours, endTime.minutes, 0, 0);

  return { start: startDate, end: endDate };
}

function parseTime(hour: string, minute: string, period?: string): { hours: number; minutes: number } | null {
  let hours = parseInt(hour);
  const minutes = parseInt(minute);

  if (period) {
    const isPM = period.toUpperCase() === 'PM';
    if (isPM && hours !== 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;
  }

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  return { hours, minutes };
}

function isRSNakshatra(nakshatra: string): boolean {
  if (!nakshatra) return false;
  
  const rsNakshatras = [
    'Bharani', 'Krittika', 'Ardra', 'Ashlesha', 'Magha',
    'Purva Phalguni', 'Chitra', 'Swati', 'Swathi', 'Vishakha',
    'Jyeshtha', 'Purva Ashadha', 'Purva Bhadrapada',
    'பரணி', 'கார்த்திகை', 'திருவாதிரை', 'ஆயில்யம்', 'மகம்',
    'பூரம்', 'சித்திரை', 'சுவாதி', 'ஸ்வாதி', 'விசாகம்',
    'கேட்டை', 'பூராடம்', 'பூரட்டாதி',
    // Additional Tamil nakshatra names
    'மிருகசீரிடம்', 'மிருகசீரிஷம்', 'திருவாதிரை', 'புனர்பூசம்', 'பூசம்',
    'ஆயில்யம்', 'மகம்', 'பூரம்', 'உத்திரம்', 'ஹஸ்தம்',
    'சித்திரை', 'சுவாதி', 'ஸ்வாதி', 'விசாகம்', 'அனுஷம்',
    'கேட்டை', 'மூலம்', 'பூராடம்', 'உத்திராடம்', 'திருவோணம்',
    'அவிட்டம்', 'சதயம்', 'பூரட்டாதி', 'உத்திரட்டாதி', 'ரேவதி'
  ];

  return rsNakshatras.includes(nakshatra);
}
