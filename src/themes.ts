export type ThemeName = 'purple' | 'blue' | 'green' | 'red';

export const THEMES = {
  purple: {
    primary: '#b388ff',
    bg: 'rgba(5, 0, 20, 0.4)',
    panel: 'rgba(20, 10, 40, 0.6)',
    text: '#e0f7fa',
    stars: ['#ffffff', '#e0f7fa', '#b388ff', '#8c9eff', '#ff8a80', '#ffd54f'],
    nebula: [
      'rgba(138, 43, 226, 0.08)',
      'rgba(0, 229, 255, 0.08)',
      'rgba(255, 0, 128, 0.06)',
      'rgba(0, 0, 255, 0.07)',
      'rgba(255, 165, 0, 0.05)'
    ],
    gradient: ['#02000a', '#0a0020', '#050010']
  },
  blue: {
    primary: '#00e5ff',
    bg: 'rgba(0, 10, 25, 0.4)',
    panel: 'rgba(5, 15, 45, 0.6)',
    text: '#e0f7fa',
    stars: ['#ffffff', '#e0f7fa', '#80d8ff', '#00b0ff', '#40c4ff', '#b3e5fc'],
    nebula: [
      'rgba(0, 100, 255, 0.08)',
      'rgba(0, 229, 255, 0.08)',
      'rgba(0, 50, 200, 0.06)',
      'rgba(100, 200, 255, 0.07)',
      'rgba(0, 150, 255, 0.05)'
    ],
    gradient: ['#000510', '#00102a', '#000a1a']
  },
  green: {
    primary: '#69f0ae',
    bg: 'rgba(0, 20, 10, 0.4)',
    panel: 'rgba(5, 35, 15, 0.6)',
    text: '#e8f5e9',
    stars: ['#ffffff', '#e8f5e9', '#b9f6ca', '#69f0ae', '#00e676', '#ccff90'],
    nebula: [
      'rgba(0, 255, 100, 0.08)',
      'rgba(100, 255, 150, 0.08)',
      'rgba(0, 200, 50, 0.06)',
      'rgba(50, 255, 200, 0.07)',
      'rgba(150, 255, 100, 0.05)'
    ],
    gradient: ['#000a05', '#001a0a', '#000f05']
  },
  red: {
    primary: '#ff5252',
    bg: 'rgba(25, 5, 5, 0.4)',
    panel: 'rgba(45, 10, 10, 0.6)',
    text: '#ffebee',
    stars: ['#ffffff', '#ffebee', '#ffcdd2', '#ef9a9a', '#e57373', '#ff8a80'],
    nebula: [
      'rgba(255, 50, 50, 0.08)',
      'rgba(255, 100, 0, 0.08)',
      'rgba(200, 0, 50, 0.06)',
      'rgba(255, 150, 50, 0.07)',
      'rgba(255, 0, 100, 0.05)'
    ],
    gradient: ['#100202', '#2a0505', '#1a0303']
  }
};
