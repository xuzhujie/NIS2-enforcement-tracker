import type { Bilingual, TranspositionState } from './nis2'

export interface CountryProfile {
  transposition_state: TranspositionState
  transposition_label: Bilingual
  source_page_updated_at: string
  national_strategy_url?: string
  national_strategy_note?: Bilingual
  competent_authority?: Bilingual
  csirt?: Bilingual
  spoc?: Bilingual
}

const transposed = { zh: '已转置（欧委会国家页）', en: 'Transposed (EC country page)' }
const reasonedOpinion = { zh: '理由意见：未通知完整转置', en: 'Reasoned opinion: full transposition not notified' }
const notYetTransposed = { zh: '尚未转置', en: 'Not yet transposed' }

function profile(
  transposition_state: TranspositionState,
  source_page_updated_at: string,
  fields: Omit<CountryProfile, 'transposition_state' | 'transposition_label' | 'source_page_updated_at'>,
): CountryProfile {
  return {
    transposition_state,
    transposition_label: transposition_state === 'transposed' ? transposed : transposition_state === 'not_yet_transposed' ? notYetTransposed : reasonedOpinion,
    source_page_updated_at,
    ...fields,
  }
}

export const countryProfiles: Record<string, CountryProfile> = {
  AT: profile('reasoned_opinion', '2025-07-07', {
    national_strategy_url: 'https://www.federal-chancellery.gv.at/cyber-security',
    competent_authority: { zh: '联邦总理府 / 联邦内政部', en: 'Federal Chancellery / Federal Ministry of the Interior' },
    csirt: { zh: 'CERT.at / GovCERT Austria', en: 'CERT.at / GovCERT Austria' },
    spoc: { zh: '联邦内政部', en: 'Federal Ministry of the Interior' },
  }),
  BE: profile('transposed', '2025-07-07', {
    national_strategy_url: 'https://www.enisa.europa.eu/topics/national-cyber-security-strategies/ncss-map/strategies/belgian-cyber-security-strategy/view',
    competent_authority: { zh: '比利时网络安全中心', en: 'Centre for Cybersecurity Belgium' },
    csirt: { zh: '比利时网络安全中心 · CERT.be', en: 'Centre for Cybersecurity Belgium · CERT.be' },
    spoc: { zh: '比利时网络安全中心', en: 'Centre for Cybersecurity Belgium' },
  }),
  BG: profile('reasoned_opinion', '2025-07-07', {
    national_strategy_url: 'https://cyberbg.eu/',
    competent_authority: { zh: '交通、信息技术与通信部', en: 'Ministry of Transport, Information Technologies and Communications' },
    csirt: { zh: '国家 CSIRT bg', en: 'National CSIRT bg' },
    spoc: { zh: '国家电子政务机构', en: 'State “E-gov” Agency' },
  }),
  HR: profile('transposed', '2025-07-07', {
    national_strategy_url: 'https://www.uvns.hr/',
    competent_authority: { zh: '经济与可持续发展部', en: 'Ministry of Economy and Sustainable Development' },
    csirt: { zh: 'CARNET / 信息系统安全局', en: 'CARNET / Information Systems Security Bureau' },
    spoc: { zh: '国家安全委员会办公室', en: 'Office of the National Security Council' },
  }),
  CY: profile('reasoned_opinion', '2025-07-07', {
    national_strategy_note: { zh: '欧委会国家页标记为 Details tbd；未提供可直接访问的战略链接。', en: 'The EC country page says “Details tbd” and does not provide a strategy link.' },
    competent_authority: { zh: '数字安全局（DSA）', en: 'Digital Security Authority (DSA)' },
    csirt: { zh: '国家 CSIRT（CSIRT-CY）', en: 'National CSIRT (CSIRT-CY)' },
    spoc: { zh: '数字安全局（DSA）', en: 'Digital Security Authority (DSA)' },
  }),
  CZ: profile('reasoned_opinion', '2025-07-07', {
    national_strategy_url: 'https://govcert.cz/',
    competent_authority: { zh: '国家网络与信息安全局（NÚKIB） / CZ.NIC', en: 'National Cyber and Information Security Agency (NÚKIB) / CZ.NIC' },
    csirt: { zh: 'GovCERT / CSIRT.CZ', en: 'GovCERT / CSIRT.CZ' },
    spoc: { zh: '国家网络与信息安全局（NÚKIB）', en: 'National Cyber and Information Security Agency (NÚKIB)' },
  }),
  DK: profile('reasoned_opinion', '2025-07-07', {
    national_strategy_url: 'https://digst.dk/',
    competent_authority: { zh: '丹麦商业管理局（DSP）；OES 由各行业主管机关负责', en: 'Danish Business Authority (DSP); sector authorities for OES' },
    csirt: { zh: '丹麦网络安全中心', en: 'Danish Centre for Cybersecurity' },
    spoc: { zh: '丹麦网络安全中心', en: 'Danish Centre for Cybersecurity' },
  }),
  EE: profile('reasoned_opinion', '2025-07-07', {
    national_strategy_url: 'https://mkm.ee/',
    competent_authority: { zh: '爱沙尼亚信息系统管理局', en: 'Estonian Information System Authority' },
    csirt: { zh: '爱沙尼亚信息系统管理局（CERT-EE）', en: 'Estonian Information System Authority (CERT-EE)' },
    spoc: { zh: '爱沙尼亚信息系统管理局', en: 'Estonian Information System Authority' },
  }),
  FI: profile('reasoned_opinion', '2025-07-07', {
    national_strategy_note: { zh: '欧委会国家页提供 urn.fi 战略链接；该入口的稳定 URL 由官方页面维护。', en: 'The EC country page links to the strategy on urn.fi; the official page maintains the stable entry point.' },
    competent_authority: { zh: '国家网络安全中心 / 芬兰交通与通信局（Traficom）；OES 由行业主管机关负责', en: 'National Cyber Security Centre / Finnish Transport and Communications Agency (Traficom); sector authorities for OES' },
    csirt: { zh: '国家网络安全中心 / Traficom', en: 'National Cyber Security Centre / Traficom' },
    spoc: { zh: '国家网络安全中心 / Traficom', en: 'National Cyber Security Centre / Traficom' },
  }),
  FR: profile('reasoned_opinion', '2025-07-07', {
    national_strategy_note: { zh: '欧委会国家页称战略已在线提供，但未在抓取结果中暴露稳定链接。', en: 'The EC country page says the strategy is available online but did not expose a stable link in the captured content.' },
    competent_authority: { zh: '国家信息系统安全局（ANSSI）', en: 'Agence nationale de la sécurité des systèmes d’information (ANSSI)' },
    csirt: { zh: 'CERT-FR', en: 'CERT-FR' },
    spoc: { zh: '国家信息系统安全局（ANSSI）', en: 'Agence nationale de la sécurité des systèmes d’information (ANSSI)' },
  }),
  DE: profile('reasoned_opinion', '2025-07-07', {
    national_strategy_url: 'https://www.bmi.bund.de/',
    competent_authority: { zh: '联邦信息安全办公室（BSI）', en: 'Federal Office for Information Security (BSI)' },
    csirt: { zh: '联邦信息安全办公室（BSI）', en: 'Federal Office for Information Security (BSI)' },
    spoc: { zh: '联邦信息安全办公室（BSI）', en: 'Federal Office for Information Security (BSI)' },
  }),
  EL: profile('transposed', '2025-07-08', {
    national_strategy_url: 'https://diavgeia.gov.gr/',
    competent_authority: { zh: '国家网络安全局（数字治理部电信与邮政总秘书处）', en: 'National Cyber Security Authority (General Secretariat of Telecommunications and Post, Ministry of Digital Governance)' },
    csirt: { zh: '希腊网络安全事件响应团队', en: 'Hellenic Cyber Security Incident Response Team' },
    spoc: { zh: '国家网络安全局', en: 'National Cyber Security Authority' },
  }),
  HU: profile('reasoned_opinion', '2025-07-07', {
    national_strategy_note: { zh: '战略以政府第 1838/2018 号法令附件形式采用；欧委会国家页未提供独立链接。', en: 'The strategy is adopted as an annex to Government Decree 1838/2018; the EC page does not provide a standalone link.' },
    competent_authority: { zh: '国家网络安全中心；OES 由国家灾害管理总局负责', en: 'National Cyber Security Centre; National Directorate General for Disaster Management for OES' },
    csirt: { zh: '国家网络安全中心 CSIRT', en: 'National Cyber Security Centre CSIRT' },
    spoc: { zh: '国家网络安全中心', en: 'National Cyber Security Centre' },
  }),
  IE: profile('reasoned_opinion', '2025-07-07', {
    national_strategy_note: { zh: '欧委会国家页提供爱尔兰政府部门战略入口；国家页内容采用政府域名。', en: 'The EC country page provides an Irish government strategy entry point.' },
    competent_authority: { zh: '国家网络安全中心；银行与金融部门由爱尔兰央行负责', en: 'National Cyber Security Centre; Central Bank of Ireland for banking and financial entities' },
    csirt: { zh: 'CSIRT-IE', en: 'CSIRT-IE' },
    spoc: { zh: 'CSIRT-IE / 通信、气候行动与环境部', en: 'CSIRT-IE / Department of Communications, Climate Action and Environment' },
  }),
  IT: profile('transposed', '2025-07-08', {
    national_strategy_url: 'https://www.acn.gov.it/portale/en/strategia-nazionale-di-cybersicurezza',
    competent_authority: { zh: '企业与意大利制造部 / 通信与信息技术高等研究所（ISCTI）', en: 'Ministry of Enterprise and Made in Italy / Istituto Superiore delle Comunicazioni e delle Tecnologie dell’Informazione (ISCTI)' },
    csirt: { zh: '意大利 CSIRT / 国家网络安全局（ACN）', en: 'CSIRT Italia / National Cybersecurity Agency (ACN)' },
    spoc: { zh: '国家网络安全局（ACN）', en: 'National Cybersecurity Agency (ACN)' },
  }),
  LV: profile('reasoned_opinion', '2025-07-07', {
    national_strategy_url: 'https://www.mod.gov.lv/en/',
    competent_authority: { zh: '交通部；OES 由经济部、卫生部等行业主管机关负责', en: 'Ministry of Transport; sector authorities including the Ministries of Economics and Health for OES' },
    csirt: { zh: '信息技术安全事件响应机构 CERT.LV', en: 'Information Technology Security Incident Response Institution CERT.LV' },
    spoc: { zh: '国防部', en: 'Ministry of Defence' },
  }),
  LT: profile('transposed', '2025-07-08', {
    national_strategy_url: 'https://e-seimas.lrs.lt/portal/legalAct/lt/TAP/931f8e20332711e8a149e8cfbedd2503',
    competent_authority: { zh: '国家网络安全中心（NCSC/CERT-LT）', en: 'National Cyber Security Centre (NCSC/CERT-LT)' },
    csirt: { zh: '国家网络安全中心（NCSC/CERT-LT）', en: 'National Cyber Security Centre (NCSC/CERT-LT)' },
    spoc: { zh: '国家网络安全中心（NCSC/CERT-LT）', en: 'National Cyber Security Centre (NCSC/CERT-LT)' },
  }),
  LU: profile('reasoned_opinion', '2025-07-07', {
    national_strategy_url: 'https://hcpn.gouvernement.lu/',
    competent_authority: { zh: '卢森堡监管研究所（ILR）；OES 由行业主管机关负责', en: 'Institut Luxembourgeois de Régulation (ILR); sector authorities for OES' },
    csirt: { zh: '政府 CERT / 国家 CERT', en: 'CERT Gouvernemental / CERT National' },
    spoc: { zh: '卢森堡监管研究所（ILR）', en: 'Institut Luxembourgeois de Régulation (ILR)' },
  }),
  MT: profile('not_yet_transposed', '2025-07-08', {
    national_strategy_note: { zh: '欧委会国家页标记为 Details tbd；未提供国家战略链接。', en: 'The EC country page says “Details tbd” and does not provide a strategy link.' },
    competent_authority: { zh: '关键信息基础设施保护部门', en: 'Critical Information Infrastructure Protection Unit' },
    csirt: { zh: 'CSIRTMalta', en: 'CSIRTMalta' },
    spoc: { zh: '关键信息基础设施保护部门', en: 'Critical Information Infrastructure Protection Unit' },
  }),
  NL: profile('reasoned_opinion', '2025-07-07', {
    national_strategy_url: 'https://www.nctv.nl/',
    competent_authority: { zh: '无线通信管理局（DSP）；OES 由行业主管机关负责', en: 'Radio Communications Agency (DSP); sector authorities for OES' },
    csirt: { zh: '国家网络安全中心（NCSC） / CSIRT-DSP', en: 'National Cyber Security Centre (NCSC) / CSIRT-DSP' },
    spoc: { zh: '国家网络安全中心（NCSC）', en: 'National Cyber Security Centre (NCSC)' },
  }),
  PL: profile('reasoned_opinion', '2025-07-07', {
    national_strategy_note: { zh: '欧委会国家页提供 ENISA 战略入口；本项目不把第三方镜像误标为国家措施。', en: 'The EC country page points to an ENISA strategy entry; this tracker does not relabel a third-party mirror as a national measure.' },
    competent_authority: { zh: '数字事务部网络安全司；OES 由行业主管机关负责', en: 'Ministry of Digital Affairs, Department of cybersecurity; sector authorities for OES' },
    csirt: { zh: 'CSIRT NASK / CSIRT MON / CSIRT GOV', en: 'CSIRT NASK / CSIRT MON / CSIRT GOV' },
    spoc: { zh: '数字事务部网络安全司', en: 'Ministry of Digital Affairs, Department of cybersecurity' },
  }),
  PT: profile('reasoned_opinion', '2025-07-07', {
    national_strategy_note: { zh: '欧委会国家页提供 ENISA 战略入口；具体战略原文仍以官方入口为准。', en: 'The EC country page points to an ENISA strategy entry; the official entry controls the strategy text.' },
    competent_authority: { zh: '葡萄牙国家网络安全中心', en: 'Portuguese National Cybersecurity Centre' },
    csirt: { zh: 'CERT.PT', en: 'CERT.PT' },
    spoc: { zh: '葡萄牙国家网络安全中心', en: 'Portuguese National Cybersecurity Centre' },
  }),
  RO: profile('transposed', '2025-07-08', {
    national_strategy_note: { zh: '欧委会国家页将战略字段标记为 Details tbd。', en: 'The EC country page marks the strategy field as “Details tbd”.' },
    competent_authority: { zh: '罗马尼亚国家计算机安全事件响应团队（CERT-RO）', en: 'Romanian National Computer Security Incident Response Team (CERT-RO)' },
    csirt: { zh: 'CERT-RO', en: 'CERT-RO' },
    spoc: { zh: 'CERT-RO', en: 'CERT-RO' },
  }),
  SK: profile('transposed', '2025-07-08', {
    national_strategy_url: 'https://www.nbu.gov.sk/en/cyber-security-concept-of-the-slovak-republic',
    competent_authority: { zh: '国家安全局', en: 'National Security Authority' },
    csirt: { zh: 'National SK-CERT', en: 'National SK-CERT' },
    spoc: { zh: '国家安全局', en: 'National Security Authority' },
  }),
  SI: profile('reasoned_opinion', '2025-07-07', {
    national_strategy_url: 'https://www.gov.si/',
    competent_authority: { zh: '信息安全管理局', en: 'Information Security Administration' },
    csirt: { zh: 'SI-CERT', en: 'SI-CERT' },
    spoc: { zh: '信息安全管理局', en: 'Information Security Administration' },
  }),
  ES: profile('reasoned_opinion', '2025-07-07', {
    national_strategy_url: 'https://www.dsn.gob.es/es/estrategias-publicaciones/estrategias/estrategia-ciberseguridad-nacional',
    competent_authority: { zh: '数字发展国务秘书；国防部 / 国家密码中心（公共部门）', en: 'Secretary of State for Digital Progress; Ministry of Defence / National Cryptologic Centre for the public sector' },
    csirt: { zh: 'INCIBE-CERT / CCN-CERT', en: 'INCIBE-CERT / CCN-CERT' },
    spoc: { zh: '国家安全委员会 / 国家安全部门', en: 'National Security Council / National Security Department' },
  }),
  SE: profile('reasoned_opinion', '2025-07-07', {
    national_strategy_note: { zh: '欧委会国家页提供瑞典政府的 National Cyber Security Strategy 入口。', en: 'The EC country page provides the Swedish Government’s National Cyber Security Strategy entry point.' },
    competent_authority: { zh: '瑞典邮政与电信管理局（PTS）；OES 由行业主管机关负责', en: 'Swedish Post and Telecom Authority (PTS); sector authorities for OES' },
    csirt: { zh: 'MSB / CERT-SE', en: 'MSB / CERT-SE' },
    spoc: { zh: '瑞典民防局（MSB）', en: 'Swedish Civil Contingencies Agency (MSB)' },
  }),
}
