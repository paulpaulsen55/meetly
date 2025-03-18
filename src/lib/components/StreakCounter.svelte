<script lang="ts">
    import { onMount } from 'svelte';
    import { userProfile } from "$lib/auth";

    let streak = $state(0);
    userProfile.subscribe((value) => {
        streak = value?.streak.streak as number;
    });

    const animationSpeed = 40;

    let tip1Distortion = $state({ x1: 0, y1: 0, x2: 0, y2: 0 });
    let tip2Distortion = $state({ x1: 0, y1: 0, x2: 0, y2: 0 });
    let tip3Distortion = $state({ x1: 0, y1: 0, x2: 0, y2: 0 });
    let flameOpacity = $state(1);
    let flameScale = $state(1);

    // Define derived path data using distortion values
    let outerFlamePath = $derived(`M13.0004 75.5001C13.0004 75.5001 24.0003 99.5 32.5004 75.5001C34.8025 69 4.50032 33.5 61.5004 ${0.00012207 + tip1Distortion.y1}C61.5004 ${0.00012207 + tip1Distortion.y1} ${64.469 + tip1Distortion.x1} ${41.0808 + tip1Distortion.y2} ${83.0004 + tip1Distortion.x2} 54.5001C${112 + tip1Distortion.x2} 75.5001 110 106.5 110 106.5C${118.251 + tip1Distortion.x1} ${99.7398 + tip1Distortion.y2} 121 81.0002 121 81.0002C148 152 92.0003 168.5 46.5004 168.5C1.00045 168.5 -12.9999 117.5 13.0004 75.5001Z`);
    let middleFlamePath = $derived(`M50.5001 88.5C51.1183 77.2491 55.5 68 ${64 + tip2Distortion.x1} ${62 + tip2Distortion.y1}C${64 + tip2Distortion.x1} ${62 + tip2Distortion.y1} ${68.5 + tip2Distortion.x2} 83.9987 ${79.0001 + tip2Distortion.x2} 93C${106.175 + tip2Distortion.x1} 116.296 89.5002 143.501 89.5002 143.501C95.6701 142.243 103.5 135.501 103.5 135.501C101.5 159.001 73.5 171.5 46.5002 169.501C11.4889 166.909 4.91386 132.659 17 110C17 110 48 134 50.5001 88.5Z`);
    let innerFlamePath = $derived(`M33 132C33 132 ${46.5 + tip3Distortion.x1} ${170.5 + tip3Distortion.y2} ${62.5 + tip3Distortion.x2} ${86.4998 + tip3Distortion.y1}C${62.5 + tip3Distortion.x2} ${86.4998 + tip3Distortion.y1} ${104.5 + tip3Distortion.x1} 128.5 64.5 168.5C62.5 170.5 35.5 171 30.9999 164.5C14.4541 140.6 33 132 33 132Z`);
    let scaleStyle = $derived(`scale(${flameScale})`);

    onMount(() => {
    // Animation for the main flame tip
    setInterval(() => {
        tip1Distortion = {
            x1: Math.sin(Date.now() / 400) * 3,
            y1: Math.sin(Date.now() / 300) * 4,
            x2: Math.sin(Date.now() / 500 + 1) * 4,
            y2: Math.sin(Date.now() / 350) * 3
        };
    }, 30);
    
    // Animation for the middle flame tip
    setInterval(() => {
        tip2Distortion = {
            x1: Math.sin(Date.now() / 350) * 2.5,
            y1: Math.sin(Date.now() / 250) * 3,
            x2: Math.sin(Date.now() / 450 + 0.5) * 3,
            y2: Math.sin(Date.now() / 400) * 2
        };
    }, animationSpeed);
    
    // Animation for the inner flame tip
    setInterval(() => {
        tip3Distortion = {
            x1: Math.sin(Date.now() / 300) * 2,
            y1: Math.sin(Date.now() / 200) * 2.5,
            x2: Math.sin(Date.now() / 400 + 0.8) * 2.5,
            y2: Math.sin(Date.now() / 350) * 1.5
        };
    }, animationSpeed);
    
    // Pulsating effect for the whole flame
    setInterval(() => {
            flameOpacity = 0.9 + Math.sin(Date.now() / 800) * 0.1;
            flameScale = 0.99 + Math.sin(Date.now() / 1200) * 0.02;
        }, animationSpeed);
    });
</script>

<div class="bg-gray-50 rounded-3xl p-4 mb-4 flex justify-center shadow-lg shadow-blue-300">
    <div class="flex flex-col items-center">
        <div class="flame-container">
            <svg width="129" height="178" viewBox="0 0 129 171" fill="none" xmlns="http://www.w3.org/2000/svg"
                 style="opacity: {flameOpacity}; transform-origin: center bottom;">
              <!-- Main flame (blue) - with dynamic path -->
              <path 
                d={outerFlamePath}
                fill="url(#paint0_linear_55_246)"
              />
              
              <!-- Middle flame (light blue) - with dynamic path -->
              <path 
                d={middleFlamePath}
                fill="url(#paint1_linear_55_246)"
              />
              
              <!-- Inner flame (white) - with dynamic path -->
              <path 
                d={innerFlamePath}
                fill="url(#paint2_linear_55_246)"
              />
              
              <defs>
                <linearGradient id="paint0_linear_55_246" x1="64.0377" y1="0.00012207" x2="64.0377" y2="168.5" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#0079EF">
                    <animate attributeName="stop-color" values="#0079EF; #0068CF; #0079EF" dur="3s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="1" stop-color="#0FBAF6">
                    <animate attributeName="stop-color" values="#0FBAF6; #09A9E6; #0FBAF6" dur="2s" repeatCount="indefinite" />
                  </stop>
                </linearGradient>
                
                <linearGradient id="paint1_linear_55_246" x1="57.5104" y1="62" x2="57.5104" y2="170.363" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#55EBFA">
                    <animate attributeName="stop-color" values="#55EBFA; #3DDFEF; #55EBFA" dur="2.5s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="1" stop-color="#90F8F7">
                    <animate attributeName="stop-color" values="#90F8F7; #7EECEC; #90F8F7" dur="2s" repeatCount="indefinite" />
                  </stop>
                </linearGradient>
                
                <linearGradient id="paint2_linear_55_246" x1="53.7363" y1="86.4998" x2="53.7363" y2="169.284" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#BCFAFB">
                    <animate attributeName="stop-color" values="#BCFAFB; #A5F0F2; #BCFAFB" dur="1.5s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="1" stop-color="white">
                    <animate attributeName="stop-color" values="white; #F5FFFF; white" dur="2s" repeatCount="indefinite" />
                  </stop>
                </linearGradient>
              </defs>
            </svg>
        </div>
        <div class="text-2xl font-bold text-blue-600">{streak}</div>
        <div class="text-sm text-blue-500">STREAK</div>
    </div>
</div>


<style>
    .flame-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 200px;
        padding: 20px;
    }
    
    @keyframes flicker {
        0% { filter: drop-shadow(0 0 5px rgba(0, 153, 255, 0.8)); }
        50% { filter: drop-shadow(0 0 8px rgba(0, 153, 255, 0.6)); }
        100% { filter: drop-shadow(0 0 5px rgba(0, 153, 255, 0.8)); }
    }
    
    svg {
        animation: flicker 3s infinite;
        filter: drop-shadow(0 0 5px rgba(0, 153, 255, 0.8));
    }
</style>