import { NextApiRequest, NextApiResponse } from 'next';

// Test endpoint using your actual sample data
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Sample data based on your actual database structure
    const sampleData = {
      id: "8fe37cce-cac2-4f64-8b78-a2342d12e5bf",
      date: "2025-09-15",
      vaara: "திங்கட்கிழமை",
      sunrise: "2025-09-15T00:31:25+00:00",
      sunset: "2025-09-15T12:36:38+00:00",
      moonrise: "2025-09-15T19:20:01+00:00",
      moonset: "2025-09-15T07:48:24+00:00",
      nakshatra: [
        {
          "id": 4,
          "end": "2025-09-15T07:31:44+05:30",
          "lord": {
            "id": 4,
            "name": "செவ்வாய்",
            "vedic_name": "செவ்வாய்"
          },
          "name": "மிருகசீரிடம்",
          "start": "2025-09-14T08:41:04+05:30"
        },
        {
          "id": 5,
          "end": "2025-09-16T06:46:10+05:30",
          "lord": {
            "id": 101,
            "name": "ராகு",
            "vedic_name": "ராகு"
          },
          "name": "திருவாதிரை",
          "start": "2025-09-15T07:31:45+05:30"
        }
      ],
      tithi: [
        {
          "id": 40,
          "end": "2025-09-16T01:31:50+05:30",
          "name": "நவமி",
          "index": 0,
          "start": "2025-09-15T03:06:36+05:30",
          "paksha": "கிருஷ்ண பக்ஷ"
        },
        {
          "id": 41,
          "end": "2025-09-17T00:22:37+05:30",
          "name": "தசமி",
          "index": 0,
          "start": "2025-09-16T01:31:51+05:30",
          "paksha": "கிருஷ்ண பக்ஷ"
        }
      ],
      karana: [
        {
          "id": 3,
          "end": "2025-09-15T14:16:07+05:30",
          "name": "சைதுளை",
          "index": 0,
          "start": "2025-09-15T03:06:36+05:30"
        },
        {
          "id": 4,
          "end": "2025-09-16T01:31:50+05:30",
          "name": "கரசை",
          "index": 0,
          "start": "2025-09-15T14:16:08+05:30"
        },
        {
          "id": 5,
          "end": "2025-09-16T12:53:57+05:30",
          "name": "வனசை",
          "index": 0,
          "start": "2025-09-16T01:31:51+05:30"
        }
      ],
      yoga: [
        {
          "id": 16,
          "end": "2025-09-16T02:34:17+05:30",
          "name": "வ்யதீபாதம்",
          "start": "2025-09-15T04:55:12+05:30"
        },
        {
          "id": 17,
          "end": "2025-09-17T00:33:54+05:30",
          "name": "வரியான்",
          "start": "2025-09-16T02:34:18+05:30"
        }
      ],
      main_nakshatra: "மிருகசீரிடம்",
      cosmic_score: 7,
      user_specific_score: null,
      tarabalam_type: null,
      rahu_kalam: "7:30 AM - 9:00 AM",
      yamagandam: "10:30 AM - 12:00 PM",
      kuligai: "1:30 PM - 3:00 PM",
      abhijit_muhurta: "11:48 AM - 12:36 PM",
      is_amavasai: false,
      is_pournami: false,
      is_mythra_muhurtham: false,
      chandrashtama_for: ["Vishakha", "விசாகம்"],
      created_at: "2025-06-23T05:15:49.924753+00:00",
      updated_at: "2025-07-31T05:53:55.03198+00:00",
      is_ashtami: false,
      is_navami: true,
      is_trayodashi: false,
      is_sashti: false,
      is_dwadashi: false,
      is_ekadashi: false,
      is_krittikai_nakshatra: false,
      is_bharani_nakshatra: false,
      is_valar_pirai: false,
      is_thei_pirai: true
    };

    // Generate ICS content using the sample data
    const icsContent = generateICSContent([sampleData], {
      include_auspicious: true,
      include_inauspicious: true,
      include_special_days: true,
      include_rs_warnings: true,
      include_chandrashtama: true,
      calendar_name: 'Sample Tamil Panchangam'
    });

    // Set appropriate headers for ICS file
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="sample-tamil-panchangam.ics"');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    return res.status(200).send(icsContent);

  } catch (error) {
    console.error('Error generating sample ICS calendar:', error);
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
