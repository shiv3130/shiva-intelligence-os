export const SKILL_TAXONOMY = {
  'Programming Languages': [
    'Python', 'Java', 'C++', 'C#', 'JavaScript', 'TypeScript', 'SQL', 'R', 'Go', 'Rust', 'Ruby', 'Scala', 'PHP', 'Swift', 'Kotlin'
  ],
  'AI / ML': [
    'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'Generative AI', 'LLMs', 'Reinforcement Learning', 'Neural Networks', 'Predictive Modeling', 'Data Science'
  ],
  'Frameworks': [
    'TensorFlow', 'PyTorch', 'Scikit-Learn', 'Keras', 'LangChain', 'Hugging Face', 'Pandas', 'NumPy', 'React', 'Angular', 'Vue', 'Next.js', 'Node.js', 'Django', 'Flask', 'FastAPI', 'Spring Boot'
  ],
  'Cloud': [
    'Azure', 'AWS', 'GCP', 'Google Cloud', 'IBM Cloud', 'Oracle Cloud'
  ],
  'MLOps': [
    'Docker', 'Kubernetes', 'MLflow', 'Kubeflow', 'Airflow', 'Vertex AI', 'SageMaker', 'Weights & Biases', 'DVC'
  ],
  'Data Engineering': [
    'Spark', 'Databricks', 'Kafka', 'Hadoop', 'Snowflake', 'BigQuery', 'Redshift', 'dbt', 'Fivetran'
  ],
  'DevOps': [
    'CI/CD', 'Terraform', 'GitHub Actions', 'Jenkins', 'GitLab CI', 'Ansible', 'Prometheus', 'Grafana', 'Linux', 'Bash'
  ],
  'Databases': [
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Cassandra', 'Elasticsearch', 'DynamoDB', 'Neo4j', 'Pinecone', 'Milvus', 'Weaviate'
  ]
};

// Flatten taxonomy for quick lookup
const CANONICAL_SKILLS = new Set<string>();
Object.values(SKILL_TAXONOMY).forEach(skills => {
  skills.forEach(skill => CANONICAL_SKILLS.add(skill.toLowerCase()));
});

// Aliases mapping to canonical names
const SKILL_ALIASES: Record<string, string> = {
  'ml': 'Machine Learning',
  'ai': 'Artificial Intelligence',
  'genai': 'Generative AI',
  'gen ai': 'Generative AI',
  'llm': 'LLMs',
  'large language models': 'LLMs',
  'cv': 'Computer Vision',
  'natural language processing': 'NLP',
  'amazon web services': 'AWS',
  'google cloud platform': 'GCP',
  'k8s': 'Kubernetes',
  'reactjs': 'React',
  'react.js': 'React',
  'node': 'Node.js',
  'nodejs': 'Node.js',
  'ts': 'TypeScript',
  'js': 'JavaScript',
  'golang': 'Go',
  'postgres': 'PostgreSQL',
  'scikit learn': 'Scikit-Learn',
  'sklearn': 'Scikit-Learn',
  'tf': 'TensorFlow',
  'pytorch': 'PyTorch',
  'gcp': 'Google Cloud'
};

export function normalizeSkill(rawSkill: string): string | null {
  if (!rawSkill || typeof rawSkill !== 'string') return null;
  
  let clean = rawSkill.trim().toLowerCase();
  
  // Remove common noise words
  clean = clean.replace(/^(experience with|knowledge of|proficient in|familiarity with|understanding of|strong|advanced|basic|working)\s+/i, '');
  clean = clean.replace(/\s+(development|programming|framework|platform|tool|technology|skills?)$/i, '');
  
  // Check aliases
  if (SKILL_ALIASES[clean]) {
    return getCanonicalCase(SKILL_ALIASES[clean]);
  }

  // Check exact match in canonical list
  if (CANONICAL_SKILLS.has(clean)) {
    return getCanonicalCase(clean);
  }

  // Fuzzy match (simple inclusion for now, could be improved with Levenshtein)
  for (const canonical of CANONICAL_SKILLS) {
    if (clean.includes(canonical) || canonical.includes(clean)) {
       // Only accept if it's a substantial match to avoid false positives (e.g. 'r' matching everything)
       if (canonical.length > 2 && clean.length > 2) {
           return getCanonicalCase(canonical);
       }
    }
  }

  return null; // Return null if it doesn't match our taxonomy to filter out noise
}

function getCanonicalCase(lowercaseSkill: string): string {
  for (const [category, skills] of Object.entries(SKILL_TAXONOMY)) {
    for (const skill of skills) {
      if (skill.toLowerCase() === lowercaseSkill.toLowerCase()) {
        return skill;
      }
    }
  }
  // Fallback Title Case
  return lowercaseSkill.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export function getSkillCategory(skillName: string): string {
  for (const [category, skills] of Object.entries(SKILL_TAXONOMY)) {
    if (skills.some(s => s.toLowerCase() === skillName.toLowerCase())) {
      return category;
    }
  }
  return 'Other';
}

export function extractSkillsFromText(text: string): string[] {
  if (!text) return [];
  const extracted = new Set<string>();
  const lowerText = text.toLowerCase();

  // Simple dictionary matching against taxonomy
  for (const canonical of CANONICAL_SKILLS) {
    // Use word boundaries to avoid partial matches (e.g., 'go' in 'algorithm')
    // Special handling for C++ and C# which have regex special chars
    let regexStr = `\\b${canonical}\\b`;
    if (canonical === 'c++') regexStr = `\\bc\\+\\+`;
    if (canonical === 'c#') regexStr = `\\bc#`;
    
    try {
      const regex = new RegExp(regexStr, 'i');
      if (regex.test(lowerText)) {
        extracted.add(getCanonicalCase(canonical));
      }
    } catch (e) {
      // Ignore regex errors for weird skill names
    }
  }

  // Check aliases too
  for (const [alias, canonical] of Object.entries(SKILL_ALIASES)) {
    let regexStr = `\\b${alias}\\b`;
    if (alias === 'c++') regexStr = `\\bc\\+\\+`;
    try {
      const regex = new RegExp(regexStr, 'i');
      if (regex.test(lowerText)) {
        extracted.add(getCanonicalCase(canonical));
      }
    } catch (e) {}
  }

  return Array.from(extracted);
}
