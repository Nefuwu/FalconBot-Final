import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Animated, PanResponder, Dimensions, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GoogleGenerativeAI } from '@google/generative-ai';
import documentContent from './assets/document'; 

export default function App() {
  const [isVisible, setIsVisible] = useState(true);
  const [userMessage, setUserMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [docContent, setDocContent] = useState(documentContent);
  const [isTyping, setIsTyping] = useState(false); 
  const [typingDots, setTypingDots] = useState(''); 
  const translateY = useRef(new Animated.Value(0)).current;
  const bounceValue = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const [inquiryTimestamps, setInquiryTimestamps] = useState([]);
  const [randomQuestions, setRandomQuestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isChatDisabled, setIsChatDisabled] = useState(false); // State to control chat input
  const [chatHistory, setChatHistory] = useState([]);

  // Intro Animation
  useEffect(() => {
    translateY.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.spring(bounceValue, {
          toValue: -10,
          friction: 1,
          useNativeDriver: true,
        }),
        Animated.spring(bounceValue, {
          toValue: 0,
          friction: 1,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Typing Animation
  useEffect(() => {
    if (isTyping) {
      const intervalId = setInterval(() => {
        setTypingDots((prevDots) => (prevDots.length === 3 ? '' : prevDots + '.'));
      }, 500); 

      return () => clearInterval(intervalId); 
    }
  }, [isTyping]);

  // Scroll Down Animation
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // Function to update chat history
  const updateChatHistory = (userInput, botResponse) => {
    const newHistory = [...chatHistory, `User: ${userInput}`, `FalconBot: ${botResponse}`];
    if (newHistory.length > 4) {
      newHistory.splice(0, newHistory.length - 4); // Keep only the last 4 entries
    }
    setChatHistory(newHistory);
  };

  // Function to send message
  const sendMessage = async (messageText, maxRetries = 3) => {
    const combinedMessage = `${docContent}\n\n${rule}\n\nUser: ${messageText}\n\nChat History: ${chatHistory.join('\n')}`;
    let attempt = 0;
  
    while (attempt < maxRetries) {
      try {
        const generator = getModel.createInstance(CurrentIdentifiers());
        const model = generator.getGenerativeModel({model:getModelName()});
        const result = await model.generateContent(combinedMessage);
        return result.response.text();
      } catch (error) {
        attempt++;
        console.error(`Attempt ${attempt} failed:`, error);
  
        // If it exceeded 3 retrys, send error message
        if (attempt >= maxRetries) {
          console.error('All retry attempts failed.');
          return 'Sorry, Klasmeyt something went wrong. Please try again.';
        }
      }
    }
  };

  // Show Suggestion
  const suggestionQuestions = [
    "Enrollments",
    "Academic Programs",
    "Grade Equivalent and Honors",
    "Guidelines on Standard Uniform and Exemption",
    "Offenses"
  ];

  // Reset Function
  const handleReset = () => {
      setMessages([]); 
      setRandomQuestions(suggestionQuestions, 5); 
      setShowSuggestions(true); 
      setChatHistory([]);
  };
  useEffect(() => {
    setRandomQuestions(suggestionQuestions, 5); 
    setShowSuggestions(true); 
  }, []); 
  const rule = "Your name is Falconbot, your job is to help Adamsonian navigate the student manual and from now on, always base your answers on the document that was sent to you. Remove all the '*' from your responses (Bold text). Paste your answer in plain text; if you use bullet points, use dashes '-'. If you want it in Bold, just paste it as plain text. If they ask you is your creator, tell them that you are modified by Adamsonian students to help them navigate the student manual";
  const identifiers = [
    'AIzaSyCLfdfN3ZVwIznQ8Xd_d2Zl7FqY5rQF2Dk',  
    'AIzaSyA2YTaP7eoxQZGz4FZP1xs31sxTYwOM8lA',  
    'AIzaSyBYJ37ILiTYxFCi6KFOS6MQ0-Ym33aYhhA',  
    'AIzaSyDquh6PNhwQ72d5jmjVbxwOf3NhfoMYxt0', 
    'AIzaSyAHPpQ8EiGCOnLedv7r-_6ggASFZs0BjMg',  
    'AIzaSyDpjbCUO39hxNHKZYb5sNRZpWO6HZDczQo',  
  ];
  let counter = 1;
  const CurrentIdentifiers = () => {
    const currentKey = identifiers[counter - 1];
    counter = counter >= identifiers.length ? 1 : counter + 1;
    return currentKey;
  };
  const getHelpResponse = () => "Sure Klasmeyt! What do you need help with?";
  const getModelName = () => 'gemini-1.5-flash';
  const getFounderInfoResponse = () => "Adamson University was founded as the Adamson School of Industrial Chemistry (ASIC) by George Lucas Adamson and his cousins, Alexander Adamson and George Athos, and began as a 42-student night class at the Paterno Building in Santa Cruz, Manila.";
  const getPresidentInfoResponse = () => "Fr. Daniel Franklin E. Pilario, CM, Ph.D., S.Th.D., is the 7th President and 3rd alumnus President of Adamson University.";
  const getGradingResponse = () => {
    return ` The university uses a numerical grading system with corresponding Grade Point Equivalents and letter grades. The grading scale is as follows:
  
  97-100 = 1.00  (A)  = Excellent
  93-96  = 1.25  (A-) = Superior
  89-92  = 1.50  (B+) = Superior
  85-88  = 1.75  (B)  = Average
  82-84  = 2.00  (B-) = Average
  79-81  = 2.25  (C+) = Average
  76-78  = 2.50  (C)  = Passed
  73-75  = 2.75  (C-) = Passed
  70-72  = 3.00  (D)  = Passed
  <70    = 5.00  (F)  = Failed
  
Dropped courses have a grade of 6.00 (DR), and No Grade (NG) has a grade point equivalent of 0.00.    `;
  };
  const getOnlineApplication = () => {
    return `1. Access the Website: Go to [https://www.adamson.edu.ph/uee/](https://www.adamson.edu.ph/uee/).  
    
2. Start Application:  
    • Click "NEW APPLICANT" for new applicants and choose the exam type.  
    • For current Adamson students, click "FOR ADAMSON UNIVERSITY STUDENTS".  

 3. Save Information: Fill out the form, save your details, and note your applicant number (your UEE account).  

4. Pay Exam Fee: Pay the UEE fee as specified in your account.  

5. Schedule Exam: Log in to your UEE account and select an exam schedule via the "Examination Schedule Module".  

6. Print UEE Permit: Print your UEE permit after scheduling.  

7. Take the Exam: Attend the exam at the location specified in your permit.  

8. View Results:  
    • Check your results in the "Examination Result Module" (tab next to the Admission Requirements module).  
    • If "Passed for Enrollment", proceed to enrollment.  
    • If "Passed for Advising", visit your preferred department for evaluation.  

9. Proceed to Enrollment: Go to the Admissions Office with:  
    • Original documents.  
    • Entrance exam result.  
    • Down payment receipt.  

10. Admission Requirements: Refer to the "Admission Requirements Module" for specific documents needed based on your status (freshman or transferee).      `;
  };
  const getFreshmenEnrollment = () => {
    return `1. Apply and pass the University Entrance Examination (UEE) and submit the following original requirements during enrollment:  

    • UEE result  
    • Form 138 (Senior High School Report Card)  
    • Two 2x2 ID pictures  
    • Certificate of Good Moral Character signed by the Principal or Guidance Counselor  
    • Authenticated Birth Certificate from PSA  
    • Letter of Application for those who delayed enrollment by a year or more after Senior High School graduation 

2. Present original credentials and UEE result to the Admissions and Student Recruitment Office.  

3. Proceed to the respective college or department chair for an interview.  

4. Submit the original requirements with college or department approval to the Admissions Office. If incomplete, submit a Letter of Undertaking instead.  

5. If passed in the interview, proceed to step 6. If not, visit the Admissions Office for a new program endorsement as advised by the department chair or dean.  

6. Submit UEE result and original credentials with college or department approval to the Admissions Office.  

7. Pay assessed fees at the Cashier.  

8. Go to the Admissions Office ID room for ID processing.  

9. Visit the Computer Laboratory to encode additional student information into the system.  

10. Purchase school uniforms at the University store.      `;
  };
  const getOldRegular = () => {
    return `1. Print or view the pre-advised subjects in Learning Management System (LMS) or e-Learning.

2. Pay at the cash Management Office or any accredited banks or any Bayad Center.

3. Print Certificate of Enrollment    `;
  };
  const getOldIrregular = () => {
    return `1. Print or view the pre-advised subjects in Learning Management System (LMS) or e-Learning.

2. Pay at the Cash Management Office, accredited banks or any Bayad Center.

3. Choose subject/s online

4. Print Certificate of Enrollment    `;
  };
  const getOldReturning = () => {
    return `1. Apply True Copy of Grades (TCG)

2. Get re-admission form from the respective department

3. Submit the processed re-admission form at the program window.

4. Once the account is generated, follow the enrollment procedure for old student.    `;
  };
  const getTransferees = () => {
    return `1. Pass the qualifying examination of the UEE.  

2. Submit the original copies of the following requirements:  

    • Honorable Dismissal/Transfer credentials  
    • Certificate of Good Moral Character from the last attended institution  
    • Certificate of True Copy of Grades  
    • Letter of Application addressed to the Registrar  
    • Four 2x2 ID pictures  
    • Authenticated Birth Certificate from PSA  
    • Original copy of the UEE result  
    
3. Present all original credentials to the Admissions Office for verification.  

4. Proceed to the college or dean for an interview.  

5. If passed in the interview, proceed to the Admissions Office to submit the UEE result with the Subject Accreditation Form approved by the college/department, along with original credentials.  

6. Get your generated/assigned student number.  

7. Pay the corresponding fees at the Cashier.  

8. Follow the subject enlistment procedure provided by the Registrar's Office.  

9. Go to the Admissions Office ID Section for ID processing.  

10. Purchase the school uniform at the University Store.  

11. Attend the orientation with a parent/guardian as scheduled.      `;
  };
  const getNonResident = () => {
    return `1. Prepare the necessary requirements:  

    • For non-consortium schools:  
        • 2 pcs. 2x2 ID pictures  
        • Permit to cross-enroll  
        • Certificate of Good Moral Character  

    • For consortium schools:  
        • 2 pcs. 2x2 ID pictures  
        • Permit to cross-enroll  

2. Present the requirements for evaluation.  

3. Accomplish the Application Form to Cross Enroll.  

4. Submit the complete requirements and the approved Application Form to Cross Enroll to the Admissions Office.  

5. Obtain a student number from the Admissions Office.  

6. Pay the assessed tuition fees in full.  

7. Follow the enrollment schedule and procedures for non-block and transferee students as provided by the Registrar's Office.  

8. Proceed to the Admissions Office ID Section for ID processing.    `;
  };
  const getInternational = () => {
    return `
      d ko pa sure rito d ko magets yung nasa sinend mo na categories
    `;
  };
  const getGraduateSchool = () => {
    return `• Doctor of Philosophy in Education with Specialization in
    • Educational Leadership
• Doctor of Philosophy in Management
• Master of Arts in: Education Psychology
• Master of Science in Pharmacy
• Master in Information Technology
• Master in Business Administration
• Master of Engineering Major in:
    • Civil Engineering 
    • Chemical Engineering 
    • Computer Engineering 
    • Electrical Engineering 
    • Electronics Engineering 
    • Industrial Engineering 
    • Mechanical Engineering
• Master of Science in:
    • Biology
    • Chemistry
Civil Engineering Construction Management Management Engineering
• Master of Arts in Communication    `;
  };
  const getTheologySchool = () => {
    return `• Doctor of Philosophy in Theology
• Master of Arts in Theology Major in: 
    • Biblical Studies
    • Moral Studies 
    • Liturgical Studies 
    • Systematic Studies 
    • Vincentian Studies
• Master in Pastoral Ministry (Non-Thesis)    `;
  };
  const getLawSchool = () => {
    return `• Bachelor of Laws    `;
  };
  const getArchiSchool = () => {
    return `• Bachelor of Science in Architecture    `;
  };
  const getBusinessAd = () => {
    return `• Bachelor of Science in: 
    • Accountancy 
    • Accounting Technology 
• Bachelor of Science in Business Administration Major in:
    • Financial Management
    • Business Economics
    • Marketing Management 
    • Operations Management    `;
  };
  const getEducationLiberal = () => {
    return `• Bachelor of Elementary Education
• Bachelor of Special Needs Education (Elementary School Education)
• Bachelor of Secondary Education Major in:
    • English
• Bachelor of Physical Education
• Bachelor of Science in Exercise and Sports Major in Fitness and Sports Management
• Bachelor of Arts in: Communication Philosophy Political Science    `;
  };
  const getEngineering = () => {
    return `• Bachelor of Science in: 
    • Chemical Engineering 
    • Chemical Process Technology 
    • Civil Engineering
    • Computer Engineering 
    • Electrical Engineering 
    • Electronics Engineering 
    • Geology
    • Industrial Engineering Mechanical Engineering
    • Mechanical Engineering Major in Mechatronics
    (dual degree)
    • Mining Engineering 
    • Petroleum Engineering    `;
  };
  const getNursing = () => {
    return `
      • Bachelor of Science in Nursing
    `;
  };
  const getPharmacy = () => {
    return `• Bachelor of Science in: 
    • Pharmacy
    • Clinical Pharmacy    `;
  };
  const getScience = () => {
    return `• Bachelor of Science in:
    • Biology
    • Chemistry 
    • Computer Science
    • Information Technology 
    • Information System 
    • Psychology
• Associate in Computer Technology (2-year course)    `;
  };

  const getInternationalTransfer = () => {
    return `
  1. Apply and pass the University Entrance Examination (UEE) and submit the following original documents:  
      • Honorable Dismissal/Transfer Credentials  
      • Certificate of Good Moral Character from the last institution attended  
      • Certificate of True Copy of Grades  
      • Photocopy of Passport (bio page) and updated visa  
  2. Proceed to the department and Office for Student Affairs (OSA) for an initial interview with endorsement from SRMES Window 1.
  3. If passed the interview, pay the acceptance fee at the Cashier.
  4. Provide a student information sheet to complete.
  5. Receive student number.
  6. Proceed to the Admissions Office for subject encoding.
  7. Proceed to ID Section for ID processing.
  8. Purchase a school uniform at the university store.
  9. Attend orientation as scheduled.`;
  };
  const getInternationalFreshmen = () => {
    return `
  1. Apply and pass the University Entrance Examination (UEE) and submit the original UEE result and international student admission requirements.
  2. Submit the requirements to SRMES Window 1.
  3. If passed the interview, proceed to the respective department for evaluation.
  4. Return to SRMES with the "OK to enroll" note from the Office for University Relations (OUR) and the academic department.
  5. Pay the acceptance fee at the Cashier.
  6. Provide a student information sheet to complete.
  7. Receive student number.
  8. Pay the down payment at the Cashier.
  9. Proceed to the Admissions Office for subject encoding.
  10. Proceed to ID Section for ID processing.
  11. Purchase a school uniform at the university store.
  12. Attend orientation as scheduled.`;
  };
  
const getFees = () => {
  return `
• Acceptance fee: Php10,000 (one-time payment).
• Foreign fee: Php5,000 (every semester).
• Fees are subject to change without prior notice as of 22 October 2018.`;
  };

  const getGradeEquivalent = () => {
    return `The university uses a numerical grading system with corresponding Grade Point Equivalents and letter grades. 

The grading scale is as follows:
97-100 = 1.00  (A)  = Excellent
93-96  = 1.25  (A-) = Superior
89-92  = 1.50  (B+) = Superior
85-88  = 1.75  (B)  = Average
82-84  = 2.00  (B-) = Average
79-81  = 2.25  (C+) = Average
76-78  = 2.50  (C)  = Passed
73-75  = 2.75  (C-) = Passed
70-72  = 3.00  (D)  = Passed
<70    = 5.00  (F)  = Failed

Dropped courses have a grade of 6.00 (DR), and No Grade (NG) has a grade point equivalent of 0.00.    `;
  };
  const getAwards = () => {
    return `1. Academic Honor requirements based on General Weighted Average (GWA):
• Summa Cum Laude: GWA <= 1.24
• Magna Cum Laude: GWA <= 1.49
• Cum Laude: GWA <= 1.74

2. Conditions for Academic Honors or Merit Award:
  • Must be a regular student taking 100% of the regular semestral load.
  • Must not have failed or dropped any course, including NSTP.
  • Must not have been found guilty of any major disciplinary case.
  • If a transferee, must have been accepted with zero credit.
  • If an Ozanam grantee, must have completed the program within the prescribed number of years plus one year, without a leave of absence.

3. Academic Merit Award:
  • Awarded to a student who has met the required GWA and has a maximum of three (3) deviations of grades lower than 2.5.

4. Transferee Requirements for Academic Merit Award:
  • A transferee must have completed at least 75% of the required credits in their program at Adamson University.

5. Exclusions in GWA Calculation:
  • Earned NSTP units shall not be included in the computation of the GWA.    `;
  };
  const getModel = {
    createInstance: (id) => new GoogleGenerativeAI(id)
  };
  const getUniformPolicy = () => {
    return `1. School Uniform:
  • All students are required to wear the complete uniform with an unfaded logo while within the school premises, except on Washday and Activity Day.

2. Identification Cards:
  • Identification cards must always be worn with the school uniform within the school premises.

3. P.E. Uniform:
  • The P.E. uniform must only be worn during P.E. classes.

4. Dress Code for Male Students:
  • Male students are not allowed to wear:
  • Earrings.
  • Shirts or armbands with fraternity/sorority logos.
  • Tongue bullets or similar accessories.    `;
  };
  const getHairCode = () => {
    return `1. Male Students:
  • Prescribed Haircut: Barber's cut or short trimmed haircut.
  • Hair Length: Hair on top must not reach beyond the eyebrow; hair at the nape must not touch the collar.
  • Bangs: Must be kept away from the face.
  • Hair Color: Only subtle hair colors are allowed.

2. Female Students:
  • Hair Neatness: Hair must be kept neat.
  • Bangs: Must be kept away from the face.
  • Hair Color: Only subtle hair colors are allowed.
  • Some programs (e.g., NSTP) may have specific hair code requirements. Students enrolled in these programs must follow the prescribed hair code.    `;
  };
  const getShoesCode = () => {
    return `1. Male Students:
  • Required Shoes: Black formal shoes.
  • Prohibited Shoes: Slippers, step-ins, wooden shoes, clogs, sling-back shoes, or rubber shoes.

2. Female Students:
  • Required Shoes: Black closed shoes, preferably with heels (1 to 2 inches).
  • Prohibited Shoes: Open-toe or open-heel shoes, slippers, step-ins, wooden shoes, clogs, sling-back shoes, or rubber shoes.    `;
  };
  const getVisaConversion = () => {
    return `Conversion from Tourist Visa 9(a) to Student Visa (9f) requires:
  • Duly accomplished CGAF (available at SRMES Window 1).
  • Photocopy of passport bio page (passport validity must be more than 60 days).
  • Photocopy of latest arrival.
  • Updated tourist visa for at least 1 month.
  • Photocopy of quarantine stamp from the passport.
  • 2 pcs of 2x2 pictures with white background.
  • Long white folder.
  • Conversion fee.
  • Failure to comply with visa conversion will result in cancellation of enrollment.`;
  };

  const getVisaExtension = () => {
    return `Student Visa Extension requires:
  • Duly accomplished CGAF and application form for Certificate of Enrollment and copy of grades.
  • Photocopy of passport bio page (passport validity must be more than 60 days).
  • Photocopy of latest arrival.
  • 2 pcs of 2x2 pictures with white background.
  • Photocopy of ACR I-card front and back.
  • Visa extension fee.
  • Failure to extend will result in being blocked during the next regular enrollment.`;
  };
  const getVisaSpecial = () => {
    return `Special Study Permit (SSP) requires:
  • Duly accomplished CGAF.
  • Photocopy of passport bio page.
  • Photocopy of latest arrival.
  • Updated tourist visa for at least 1 month.
  • Photocopy of quarantine stamp from the passport.
  • 2 pcs of 2x2 pictures with white background.
  • SSP fee.
  • SSP is for foreign nationals under 18 years old or taking non-degree courses.`;
  };
  const getVisaDiplomat = () => {
    return `Diplomat requires:
  • Photocopy of ACR I-card front and back with updated visa.
  • Photocopy of passport bio page.`;
  };
  const getVisaRefugees = () => {
    return `Refugees require:
  • Certification and valid ID issued by the Department of Justice (DOJ).`;
  };
  const getVisaPermanent = () => {
    return `Permanent Resident Visa (PRV) requires:
  • Photocopy of ACR I-card front and back.`;
  };
  const getVisaProvision = () => {
    return `Provision for International Students who Graduated from Philippine Schools:
  • Admission requirements are the same as for Filipinos.
  • Provide a copy of passport bio page with updated visa.
  • Follow the same admission procedure as international students.`;
  };
  const getVisaDual = () => {
    return `Provision for Dual Citizenship:
  • Proceed to Admissions Office and follow the admission procedure for Filipinos.`;
  };
  const getUniformExemption = () => {
    return `Exemptions for not wearing the prescribed uniform can be granted by the Office for Student Affairs (OSA) for the following cases:
  • On-the-Job Training (OJT) students.
  • Full-time working students.
  • Accident or health-related incidents.    `;
  };
  const getMajorOffense = () => {
    return `Under this section, Penalty/Sanction:
From Suspension to Exclusion/Dismissal/Expulsion

a. Possession/distribution of pornographic materials or access to pornographic sites on campus.  
b. Gambling or playing cards on campus.  
c. Public display of inappropriate affection on campus.  
d. Insulting or converting others' religious beliefs or practices.  
e. Creating noise or shouting inside/outside classrooms.  
f. Unauthorized campus entry or pretending to be someone else.  
g. Forcible entry into the campus.  
h. Using fake/unauthorized IDs or lending IDs to others.  
i. Altering student IDs for fraudulent purposes.  
j. Forcing students to join illegal groups.  
k. Any form of bullying (verbal, physical, cyber).  
l. Misusing or tampering with car pass stickers.  
m. Cheating during exams.  
n. Staying on campus past curfew or overnight without permission.  
o. Disrupting academic functions or events.  
p. Vandalism or damage to school property.  
q. Entering the campus drunk or drinking on campus.  
r. Acts causing dishonor to the University or its members.  
s. Oral or written defamation.  
t. Indecent behavior or sexual provocation.  
u. Misusing instruments like radios, megaphones, or phones during class.  
v. Posting/distributing unauthorized notices or propaganda.  
w. Smoking on school premises.  
x. Engaging in cybercrimes or related offenses.  

Under this section, Penalty/Sanction:
From Exclusion/Dismissal to Expulsion

a. Unauthorized solicitation or extortion of money under false pretense.  
b. Bribery involving faculty, staff, or students.  
c. Taking an exam for another or having someone else take your exam.  
d. Violating the Anti-Sexual Harassment Law (RA 7877).  
e. Assault, including fist-fighting or armed combat.  
f. Gross disrespect to faculty, staff, or administration.  
g. Intimidating or preventing others from entering campus or attending classes.  
h. Theft of school or personal property.  
i. Physical assault on students, staff, or authority figures.  
j. Conspiring to harm the integrity or reputation of the institution or its members.  
k. Making grave threats, including death threats or blackmail.  
l. Conviction for a criminal offense involving moral turpitude.  
m. Forging or falsifying official records or documents.  
n. Tampering with school documents, files, or records.  
o. Membership in unrecognized groups or fraternities/sororities.  
p. Violating the Anti-Hazing Law or recruiting for unrecognized organizations.  
q. Wearing apparel with unrecognized fraternity/sorority insignia.  
r. Causing serious physical injury.  
s. Possessing weapons, explosives, or related devices on campus.  
t. Violating the Dangerous Drugs Act (RA 9165).  
u. Immoral acts or involvement in abortion.  
v. Displaying nudity or indecent images through media or social platforms.  
w. Misusing or embezzling funds.  
x. Displaying visible permanent tattoos.  
y. Repeated violations of school policies or gross misconduct.  
z. Dishonesty in any form.  
aa. Committing acts that violate the Revised Penal Code or special laws.      `;
  };
  const getMinorOffenses = () => {
    return `First Offense: Oral reprimand by the Discipline Section Officer and a written apology noted by the Chairperson/Dean.
Second Offense: Oral and written reprimand by the OSA Director/DS Officer and a written apology noted by the Chairperson/Dean.
Third Offense: Treated as a major offense and referred to the Committee on Student Discipline (CSD).

a. Littering and loitering
b. Using vulgar words & displaying rough behavior
c. Using of abusive or obscene language
d. Wearing of Improper uniform
e. Wearing of:
    • Miniskirts, above the knee dresses and pants
    • Tight fitting pants, leggings and Tattered/Ripped pants with skin exposure
    • Walking shorts
    • Tight fitting blouses
    • Sleeveless shirt/blouse
    • Backless blouse/dress
    • Off-shoulder blouse/dress
    • See-through shirts/blouses
    • T-shirt/Blouses with indecent pictures/prints
    • Hanging Blouse
f. Non-wearing of ID
g. Improper wearing of ID/ Using unauthorized college ID lace
h. Wearing of earrings for boys
i. Wearing of elaborate earrings for girls.
j. Sporting improper haircut for boys
k. Sporting dyed-hair
l. Wearing of Make-up/Cross dressing for Gays and Lesbians
m. Wearing of unprescribed shoes
n. Unauthorized use of school facilities including classroom
o. Playing pranks, putting up feet on chairs, tables & walls
p. Using faded school logo on uniform.
q. Unauthorized entry of wine, liquor or any intoxicating beverages on the campus.
r. Non-compliance with the required physical and medical examination (for freshmen).
s. Non-compliance of the required Teachers Behavioral Inventory (TBI)
t. Violation of traffic rules along San Marcelino Street.    `;
  };
  const getWhenEnrollResponse = () => {
    return {
      text: `The enrollment period for all types of students is not specified in the document.

The document does state that the temporary assessment of tuition and other school fees is available at the E-Learning. This implies that you can check the E-Learning for more specific information about the enrollment period.     `,
      options: [] 
    };
  };
  
  const getEnrollmentResponse = () => ({
    text: "Please Specify",
    followUp: true, 
    options: ["For Online application for university entrance examination", "For Freshmen", "For Old Students", "Transferees enrollment procedure", "Nonresident students", "International students enrollment procedure"],
  });
  
  const getEnrollmentResponse1 = () => ({
    text: "Please Specify",
    followUp: true, 
    options: ["Old Regular Student", "Old Irregular Student", "Old Returning Student"],
  });

  const getInternationalOption = () => ({
    text: `
1. Online Application for University Entrance Examination (UEE)
2. Requirements for Admission of International Students:
    • Letter of application to enroll addressed to the University Registrar, including the intended course and the name of the last school attended.
    • Five (5) copies of the Students' Personal History Statement (PHS) signed by the student in both English and the national alphabet, accompanied by their thumbprints and a 2x2 inch photo on a plain white background taken not more than six months prior.
    • Official Transcript of Records/Scholastic Records authenticated by the Philippine Embassy or Consulate.
    • Police Clearance authenticated by the Philippine Embassy or Consulate.
    • Notarized affidavit of support with proof of financial support for accommodation, subsistence, school dues, and other expenses, authenticated by the Philippine Embassy or Consulate.
    • Photocopy of passport data page authenticated by the Philippine Foreign Service Post.
    • Photocopy of Quarantine Test (Medical Examination Result).
    • Four (4) copies of 2x2 ID pictures with a white background.
    • Php10,000 for the acceptance fee (one-time payment).
    • Php5,000 for foreign fee (every semester).
    • University Entrance Examination Fee.`,
    followUp: true, 
    options: ["Freshmen Admission Procedure", "Transferee Admission Procedure", "International Student Requirements per Visa Type", "Fees"],
  });

  const getAcademic = () => ({
    text: "Please Specify",
    followUp: true, 
    options: ["Graduate School", "St. Vincent School of Theology", "College of Law", "College of Architecture", "College of Business Administration", "College of Education and Libreal Arts", "College of Engineering", "College of Nursing", "College of Pharmacy", "College of Science"],
  });
  
  const getEquivalent = () => ({
    text: "Please Specify",
    followUp: true, 
    options: ["Grade Equivalent", "Honors and Awards"],
  });

  const getVisa = () => ({
    text: "Please Specify",
    followUp: true, 
    options: ["Conversion from Tourist Visa to Student Visa requires", "Student Visa Extension requires", "Special Study Permit (SSP) requires", "Diplomat requires", "Refugees requires", "Permanent Resident Visa (PRV) requires", "Provision for International Students who Graduated from Philippine Schools", "Provision for Dual Citizenship"],
  });

  const getGuidelines = () => ({
    text: "Please Specify",
    followUp: true, 
    options: ["Uniform Policy", "Hair Code", "Shoes Code", "Exemption from Uniform Requirement"],
  });

  const getOffenses = () => ({
    text: "Please Specify",
    followUp: true, 
    options: ["Minor Offense", "Major Offense"],
  });


  // Function to handle when the enrollment question is triggered
  const handleEnrollmentResponse = () => {
    setIsChatDisabled(true); // Disable chat input
    const response = getEnrollmentResponse();
  
    // Update messages to show the bot's response
    setMessages(prevMessages => [
      ...prevMessages,
      { text: response.text, isUser: false, options: response.options } // Store text and options separately
    ]);
  
    // Simulate typing
    setTimeout(() => {
      setIsTyping(false); // Stop typing after 2 seconds
      setIsChatDisabled(false); // Re-enable chat input after response
    }, 2000);
  };


  const responseMapping = {
    grading: {
      system: getGradingResponse,
    },
  
    for: {
      online: getOnlineApplication,
      freshmen: getFreshmenEnrollment,
      old: getEnrollmentResponse1,
    },

    old: { 
      irregular: getOldIrregular,
      regular: getOldRegular,
      returning: getOldReturning,
    },

    procedure: {
      transferee: getInternationalTransfer,
      transferees: getTransferees,
      international: getInternationalOption,
      freshmen: getInternationalFreshmen,
    },

    fees: getFees,

    visa: {
      type: getVisa,
      conversion: getVisaConversion,
      extension: getVisaExtension,
      permanent: getVisaPermanent,
    },

    special: getVisaSpecial,
    diplomat: getVisaDiplomat,
    refugees: getVisaRefugees,
    dual: getVisaDual,
    provision: {
      international: getVisaProvision,
    },

    nonresident: {
      students: getNonResident,
    },
  
    when: {
      enroll: getWhenEnrollResponse,
    },
    enroll: getEnrollmentResponse,
    enrollments: getEnrollmentResponse, 
    academic: {
      programs: getAcademic,
    },
    honors: {
      grade: getEquivalent,
      awards: getAwards,
    },
    grade: {
      equivalent: getGradeEquivalent,
    },
    guidelines: {
      exemption: getGuidelines,
    },
    uniform: {
      policy: getUniformPolicy,
      exemption: getUniformExemption,
    },
    code: {
      hair: getHairCode,
      shoes: getShoesCode,
    },
    offenses: getOffenses,
    offense: {
      major: getMajorOffense,
      minor: getMinorOffenses,
    },

    school: {
      graduate: getGraduateSchool,
      theology: getTheologySchool,
    },
    college: {
      law: getLawSchool,
      architecture: getArchiSchool,
      business: getBusinessAd,
      education: getEducationLiberal,
      engineering: getEngineering,
      nursing: getNursing,
      pharmacy: getPharmacy,
      science: getScience,
    },
    help: getHelpResponse,
  
    who: {
      founder: getFounderInfoResponse,
      founded: getFounderInfoResponse,
      president: getPresidentInfoResponse,
    },
  };

  // Rule Based Response Function
  const handleSuggestionPress = async (question) => {
    const newUserMessage = { text: question, isUser: true };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setShowSuggestions(false);

    const ruleResponse = getResponse(question);
    if (ruleResponse) {
        setIsTyping(true);
        setTimeout(() => {
            if (ruleResponse.followUp) {
                setMessages((prevMessages) => [
                    ...prevMessages, 
                    { text: ruleResponse.text, isUser: false, options: ruleResponse.options }
                ]);
            } else {
                setMessages((prevMessages) => [...prevMessages, { text: ruleResponse, isUser: false }]);
            }
            setIsTyping(false);
        }, 300);        
      // Update chat history with new user message and bot response
      updateChatHistory(question, ruleResponse);
        return;
    }

    setIsTyping(true);
    try {
        const botResponse = await sendMessage(question); 
        const newBotMessage = { text: botResponse, isUser: false };
        setMessages((prevMessages) => [...prevMessages, newBotMessage]);
    } catch (error) {
        console.error("There was an error fetching the data:", error);
    } finally {
        setIsTyping(false);
        Keyboard.dismiss();
    }
  
    setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };


  const getResponse = (messageText) => {
    const lowerCaseMessage = messageText.toLowerCase();

    // Check for top-level keywords
    for (const key in responseMapping) {
      if (lowerCaseMessage.includes(key)) {
        if (typeof responseMapping[key] === 'function') {
          return responseMapping[key](); 
        } else if (typeof responseMapping[key] === 'object') {
          for (const subKey in responseMapping[key]) {
            if (lowerCaseMessage.includes(subKey)) {
              return responseMapping[key][subKey](); 
            }
          }
        }
      }
    }
    return null; 
  };

  // Generator Response Function
  const handleSend = async () => {
    if (userMessage.trim() === '') return;
    const currentTime = Date.now();
    // Rate limiting logic
    const recentInquiries = inquiryTimestamps.filter(timestamp => currentTime - timestamp < 60000);
    if (recentInquiries.length >= 10) {
        const newBotMessage = { text: "Slow down with your inquiries, klasmeyt", isUser: false };
        setMessages((prevMessages) => [...prevMessages, newBotMessage]);
        return;
    }
    // Add current timestamp
    setInquiryTimestamps([...recentInquiries, currentTime]);

    const newUserMessage = { text: userMessage, isUser: true };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);

    setIsVisible(false); 
    setShowSuggestions(false);
    setUserMessage('');

    setIsTyping(true);
    try {
        let botResponse = await sendMessage(userMessage);
        botResponse = botResponse.trim();
        const newBotMessage = { text: botResponse, isUser: false };
        setMessages((prevMessages) => [...prevMessages, newBotMessage]);

        // Update chat history with new user message and bot response
        updateChatHistory(userMessage, botResponse);
    } catch (error) {
        console.error("There was an error fetching the data:", error);
    } finally {
        setIsTyping(false);
    }

    Keyboard.dismiss();
    setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 50);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return gestureState.dy < -10;
      },
      onPanResponderMove: Animated.event(
        [null, { dy: translateY }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy < -100) {
          Animated.timing(translateY, {
            toValue: -Dimensions.get('window').height,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            setIsVisible(false);
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>FalconBot</Text>
        <TouchableOpacity 
          style={styles.resetButton} 
          onPress={() => {
            if (!isTyping) {  
              handleReset();
            }
          }}
          disabled={isTyping}  
        >
          <Text style={[styles.resetButtonText, isTyping && { opacity: 0.5 }]}>
            Reset
          </Text>
        </TouchableOpacity>
      </View>
  
      {isVisible && (
        <Animated.View
          style={[styles.swipeUpContainer, { transform: [{ translateY }, { translateY: bounceValue }] }]}
          {...panResponder.panHandlers}
        >
          <Image 
            source={require('./assets/adamsonlogo.png')} 
            style={styles.image} 
          />
          <Text style={styles.title}>Adamson Student Manual</Text>
          <View style={styles.swipeInfo}>
            <Text style={styles.swipeText}>Swipe up</Text>
            <Ionicons name="arrow-up" size={24} color="gray" />
          </View>
        </Animated.View>
      )}
  
      <ScrollView ref={scrollViewRef} contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }} keyboardShouldPersistTaps='handled'>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View>
            <View style={styles.content}>
              {/* Initial Greeting Message */}
              <View style={styles.messageContainerLeft}>
                <Image source={require('./assets/adamsonlogo.png')} style={styles.chatImage} />
                <View style={styles.botContainer}>
                  <Text style={styles.chatTextbot}>Hello Klasmeyt! How can I help you today?</Text>
                </View>
              </View>
  
              {/* Render messages */}
              {messages.map((message, index) => (
                <View key={index} style={message.isUser ? styles.messageContainerRight : styles.messageContainerLeft}>
                  {!message.isUser && <Image source={require('./assets/adamsonlogo.png')} style={styles.chatImage} />}
                  <View style={message.isUser ? styles.userContainer : styles.botContainer}>
                    <Text style={message.isUser ? styles.chatTextuser : styles.chatTextbot}>
                      {message.text}
                    </Text>
                    {/* Show options if available */}
                    {message.options && message.options.length > 0 && (
                      <View style={styles.optionContainer}>
                        {message.options.map((option, idx) => (
                          <TouchableOpacity key={idx} style={styles.optionButton} onPress={() => handleSuggestionPress(option)}>
                            <Text style={styles.optionText}>{option}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              ))}
  
              {/* Suggestions section */}
              {showSuggestions && (
                <View style={styles.suggestionContainer}>
                  {randomQuestions.map((question, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={styles.suggestionButton} 
                      onPress={() => handleSuggestionPress(question)}
                    >
                      <Text style={styles.suggestionText}>{question}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
  
              {/* Typing indicator */}
              {isTyping && (
                <View style={styles.messageContainerLeft}>
                  <Image source={require('./assets/adamsonlogo.png')} style={styles.chatImage} />
                  <View style={styles.botContainer}>
                    <Text style={styles.typingText}>Typing{typingDots}</Text> 
                  </View>
                </View>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
  
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.textInput, isTyping && styles.disabledTextInput]}
            placeholder={isTyping ? "Please wait..." : "Type here..."}
            value={userMessage}
            onChangeText={setUserMessage}
            editable={!isTyping} // Disable input based on isChatDisabled state
          />
          <TouchableOpacity style={styles.iconContainer} onPress={handleSend}>
            <Ionicons name="send" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <StatusBar style="auto" />
    </SafeAreaView>
  );
  
  
}


// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    top: 20,
    height: 100, 
    flexDirection: 'row',
    justifyContent: 'space-between', 
    alignItems: 'center', 
  },
  headerText: {
    color: '#264577',
    fontSize: 20,
    fontWeight: 'bold',
  },
  swipeUpContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f1f1f1',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    paddingBottom: 50, 
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#264577',
    textAlign: 'center',
  },
  typingText: {
    color: '#f2f2f2',
    fontStyle: 'italic',
    fontSize: 16,
  },
  swipeInfo: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  swipeText: {
    color: 'gray',
    fontSize: 16,
    marginRight: 8,
  },
  keyboardAvoidingContainer: {
    justifyContent: 'flex-end', 
  },
  content: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
    justifyContent: 'flex-end', 
  },
  messageContainerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  messageContainerRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  botContainer: {
    backgroundColor: '#729ada',
    borderRadius: 10,
    padding: 10,
    maxWidth: '80%',
  },
  userContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    maxWidth: '80%',
    borderColor: '#264577',  
    borderWidth: 1,       
  },
  chatImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  chatTextbot: {
    color: '#fff',
    fontSize: 15,
    // Andito yung fontjustify
    textAlign: 'left',
    margin: 5,
  },
  chatTextuser: {
    color: '#264577',
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    padding: 10,
    backgroundColor: '#fff',
  },
  textInput: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    height: 40,
  },
  iconContainer: {
    marginLeft: 10,
  },
  disabledTextInput: {
    backgroundColor: '#e0e0e0', 
  },

  suggestionContainer: {
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 5,
    marginLeft: 61.5,
    marginBottom: 10,

  },
  suggestionButton: {
    backgroundColor: '#86a8df',
    borderRadius: 5,
    padding: 10,
    margin: 4,
  },
  suggestionText: {
    color: '#fff',
    fontSize: 16,
  },
  resetButton: {
    padding: 10,
    backgroundColor: '#264577',
    borderRadius: 5,
  },
  resetButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: 'bold',
  },
  gradingTable: {
    padding: 5,
    backgroundColor: '#fff',
    borderRadius: 5,
    elevation: 1,
  },
  tableContainer: {
    overflow: 'scroll',
  },
  gradingHeader: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  tableHeader: {
    fontWeight: 'bold',
    width: 100,
  },
  tableCell: {
    width: 100, 
  },
  optionContainer: {
    flexDirection: "list",
    justifyContent: 'left',
    padding: 5,
  },
  optionButton: {
    backgroundColor: '#86a8df',
    borderRadius: 5,
    padding: 10,
    margin: 5,
    },
  optionText: {
    color: '#fff',
    fontSize: 16,  
    textAlign: 'center'
  },
});
